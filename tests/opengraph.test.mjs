import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import dns from "node:dns/promises";
import https from "node:https";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { gzipSync } from "node:zlib";
import { normalizeLinkUrl } from "../lib/link-url.ts";
import { extractMetadata, fetchOpenGraph, isPublicAddress, resolvePublicTarget } from "../lib/opengraph.ts";
import { handleOpenGraph as POST } from "../lib/opengraph-route.ts";

afterEach(() => mock.restoreAll());

function mockPages(pages) {
  const visited = [];
  mock.method(dns, "lookup", async () => [{ address: "93.184.215.14", family: 4 }]);
  mock.method(https, "get", (url, options, callback) => {
    visited.push(url.href);
    options.lookup(url.hostname, { all: false }, (error, address, family) => {
      assert.equal(error, null);
      assert.equal(address, "93.184.215.14");
      assert.equal(family, 4);
    });
    const page = pages.shift();
    assert.ok(page, "Unexpected outbound request");
    const request = new EventEmitter();
    queueMicrotask(() => {
      const response = new PassThrough();
      response.statusCode = page.status ?? 200;
      response.headers = { "content-type": "text/html; charset=utf-8", ...page.headers };
      response.complete = true;
      callback(response);
      if (!response.destroyed) response.end(page.html ?? "<title>기본 제목</title>");
    });
    return request;
  });
  return visited;
}

test("bare domains, protocol-relative URLs and explicit HTTP normalize correctly", () => {
  assert.equal(normalizeLinkUrl(" naver.com "), "https://naver.com/");
  assert.equal(normalizeLinkUrl("//example.com/path?q=1#here"), "https://example.com/path?q=1#here");
  assert.equal(normalizeLinkUrl("http://example.com/a"), "http://example.com/a");
  assert.equal(normalizeLinkUrl("example.com:443/a"), "https://example.com/a");
  assert.ok(normalizeLinkUrl("한글.kr/문서").startsWith("https://xn--"));
});

test("invalid schemes, credentials, whitespace and malformed URLs are rejected", () => {
  for (const url of ["", "https://", "javaScript:alert(1)", "file:///etc/passwd", "https://me:secret@example.com", "not a url", "https://example.com\\@localhost", "x".repeat(4097)]) {
    assert.throws(() => normalizeLinkUrl(url), url);
  }
});

test("Open Graph takes priority and entities, relative images and attribute order are handled", () => {
  const metadata = extractMetadata(`
    <title>Fallback</title><meta name="twitter:title" content="Twitter">
    <!-- <meta property="og:title" content="Commented out"> -->
    <script>const fake = '<meta property="og:title" content="Fake">';</script>
    <META content='한입 &amp; 링크 &#x1F517;' PROPERTY='og:title'>
    <meta property="og:description" content="첫 줄&#10; 다음 줄">
    <meta content="../cover.png?a=1&amp;b=2" property="og:image">
    <meta property="og:url" content="https://unrelated.example/">
  `, "https://example.com/articles/1");
  assert.deepEqual(metadata, {
    title: "한입 & 링크 🔗", description: "첫 줄 다음 줄",
    thumbnail: "https://example.com/cover.png?a=1&b=2", url: "https://example.com/articles/1",
  });
});

test("fallback metadata, base URLs, unsafe images and duplicate tags are handled", () => {
  const metadata = extractMetadata(`<base href="/assets/"><title>A &amp; B</title>
    <meta name="description" content="문서 설명"><meta property="og:image" content="javascript:alert(1)">
    <meta name="twitter:image" content="cover.jpg">`, "https://example.com/post");
  assert.equal(metadata.title, "A & B");
  assert.equal(metadata.description, "문서 설명");
  assert.equal(metadata.thumbnail, "https://example.com/assets/cover.jpg");
  assert.equal(extractMetadata("<body>본문</body>", "https://example.com").title, "example.com");
  assert.equal(extractMetadata('<meta property="og:image" content="data:image/png;base64,abcd">', "https://example.com").thumbnail, null);
  assert.equal(extractMetadata('<meta property="og:title" content="First"><meta property="og:title" content="Second">', "https://example.com").title, "First");
});

test("private, loopback, link-local, mapped and reserved addresses are blocked", () => {
  for (const address of ["127.0.0.1", "10.0.0.1", "172.16.1.1", "192.168.0.1", "169.254.169.254", "0.0.0.0", "100.64.0.1", "::1", "fc00::1", "fe80::1", "::ffff:127.0.0.1", "2001:db8::1", "224.0.0.1"]) {
    assert.equal(isPublicAddress(address), false, address);
  }
  assert.equal(isPublicAddress("8.8.8.8"), true);
  assert.equal(isPublicAddress("2606:4700:4700::1111"), true);
});

test("DNS answers containing any private address and nonstandard ports are blocked", async () => {
  mock.method(dns, "lookup", async () => [{ address: "8.8.8.8", family: 4 }, { address: "127.0.0.1", family: 4 }]);
  for (const url of ["https://example.com", "https://example.com:3000", "https://localhost", "http://2130706433", "https://[::ffff:127.0.0.1]"]) {
    await assert.rejects(resolvePublicTarget(new URL(url), AbortSignal.timeout(1000)), /공개된/);
  }
});

test("redirects are resolved, compressed HTML is decoded and final URLs are saved", async () => {
  const visited = mockPages([
    { status: 302, headers: { location: "/final" } },
    { headers: { "content-encoding": "gzip" }, html: gzipSync('<meta property="og:title" content="최종 제목"><meta property="og:image" content="/image.jpg">') },
  ]);
  const metadata = await fetchOpenGraph("example.com");
  assert.deepEqual(visited, ["https://example.com/", "https://example.com/final"]);
  assert.equal(metadata.title, "최종 제목");
  assert.equal(metadata.url, "https://example.com/final");
  assert.equal(metadata.thumbnail, "https://example.com/image.jpg");
});

test("redirects to internal services are blocked before connecting", async () => {
  const visited = mockPages([{ status: 302, headers: { location: "http://169.254.169.254/latest/meta-data" } }]);
  await assert.rejects(fetchOpenGraph("https://example.com"), /공개된/);
  assert.equal(visited.length, 1);
});

test("redirect loops, upstream failures and non-HTML responses return helpful errors", async () => {
  mockPages(Array.from({ length: 5 }, () => ({ status: 302, headers: { location: "/again" } })));
  await assert.rejects(fetchOpenGraph("https://example.com"), /주소 이동/);
  mock.restoreAll();
  mockPages([{ status: 403 }]);
  await assert.rejects(fetchOpenGraph("https://example.com"), /접근하지/);
  mock.restoreAll();
  mockPages([{ headers: { "content-type": "application/pdf" } }]);
  await assert.rejects(fetchOpenGraph("https://example.com"), /웹페이지 주소/);
});

test("decompressed size limits prevent oversized pages and compression bombs", async () => {
  mockPages([{ headers: { "content-encoding": "gzip" }, html: gzipSync("a".repeat(2 * 1024 * 1024 + 1)) }]);
  await assert.rejects(fetchOpenGraph("https://example.com"), /너무 커서/);
});

test("private thumbnails are omitted and aborted requests never connect", async () => {
  mockPages([{ html: '<title>정상 페이지</title><meta property="og:image" content="http://127.0.0.1/image">' }]);
  assert.equal((await fetchOpenGraph("example.com")).thumbnail, null);
  const visited = mockPages([]);
  await assert.rejects(fetchOpenGraph("example.com", AbortSignal.abort()), /응답이 지연/);
  assert.equal(visited.length, 0);
});

test("API validates JSON, rejects oversized bodies and returns all four metadata fields", async () => {
  for (const body of ["invalid", "null", '{}', '{"url":123}']) {
    const response = await POST(new Request("http://localhost/api/opengraph", { method: "POST", body }));
    assert.equal(response.status, 400);
  }
  const large = await POST(new Request("http://localhost/api/opengraph", { method: "POST", body: "x".repeat(16_385) }));
  assert.equal(large.status, 413);
  mockPages([{ html: '<meta property="og:title" content="제목"><meta property="og:description" content="설명"><meta property="og:image" content="/thumb.png">' }]);
  const response = await POST(new Request("http://localhost/api/opengraph", { method: "POST", body: JSON.stringify({ url: "example.com" }) }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { title: "제목", description: "설명", thumbnail: "https://example.com/thumb.png", url: "https://example.com/" });
});
