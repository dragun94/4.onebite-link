import dns from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import { isIP } from "node:net";
import { createBrotliDecompress, createGunzip, createInflate } from "node:zlib";
import { Parser } from "htmlparser2";
import ipaddr from "ipaddr.js";
import { normalizeLinkUrl, type LinkMetadata } from "./link-url.ts";

const MAX_BYTES = 2 * 1024 * 1024;
const MAX_REDIRECTS = 4;

export class OpenGraphError extends Error {
  status: number;
  constructor(message: string, status = 422) {
    super(message);
    this.name = "OpenGraphError";
    this.status = status;
  }
}

export function isPublicAddress(address: string): boolean {
  return ipaddr.isValid(address) && ipaddr.process(address).range() === "unicast";
}

function withAbort<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const abort = () => reject(signal.reason);
    signal.addEventListener("abort", abort, { once: true });
    promise.then(resolve, reject).finally(() => signal.removeEventListener("abort", abort));
  });
}

/** Validate every redirect, then pin the validated DNS result to the connection. */
export async function resolvePublicTarget(url: URL, signal: AbortSignal) {
  const hostname = url.hostname.replace(/^\[|\]$/g, "").replace(/\.$/, "").toLowerCase();
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password ||
      (url.port && !["80", "443"].includes(url.port)) ||
      /(^|\.)(localhost|local|internal|home|lan)$/.test(hostname)) {
    throw new OpenGraphError("외부에 공개된 웹페이지 주소만 사용할 수 있어요.", 400);
  }
  const addresses = isIP(hostname)
    ? [{ address: hostname, family: isIP(hostname) }]
    : await withAbort(dns.lookup(hostname, { all: true }), signal);
  if (!addresses.length || addresses.some(item => !isPublicAddress(item.address))) {
    throw new OpenGraphError("외부에 공개된 웹페이지 주소만 사용할 수 있어요.", 400);
  }
  return addresses.find(item => item.family === 4) ?? addresses[0];
}

export function extractMetadata(html: string, pageUrl: string): LinkMetadata {
  const meta = new Map<string, string>();
  let title = "";
  let inTitle = false;
  let baseUrl = pageUrl;
  let hasBase = false;
  const parser = new Parser({
    onopentag(tag, attributes) {
      if (tag === "title") inTitle = true;
      if (tag === "base" && attributes.href && !hasBase) {
        try { baseUrl = normalizeLinkUrl(new URL(attributes.href, pageUrl).href); hasBase = true; } catch { /* Ignore unsafe bases. */ }
      }
      if (tag !== "meta") return;
      const key = (attributes.property || attributes.name || "").trim().toLowerCase();
      const value = attributes.content?.trim();
      if (value && !meta.has(key)) meta.set(key, value);
    },
    ontext(text) { if (inTitle) title += text; },
    onclosetag(tag) { if (tag === "title") inTitle = false; },
  }, { decodeEntities: true });
  parser.end(html);

  const clean = (value: string, limit: number) => value.replace(/\s+/g, " ").trim().slice(0, limit);
  let thumbnail: string | null = null;
  for (const key of ["og:image:secure_url", "og:image", "og:image:url", "twitter:image", "twitter:image:src"]) {
    const image = meta.get(key);
    if (!image) continue;
    try { thumbnail = normalizeLinkUrl(new URL(image, baseUrl).href); break; } catch { /* Try the next image. */ }
  }
  return {
    title: clean(meta.get("og:title") || meta.get("twitter:title") || title || new URL(pageUrl).hostname, 200),
    description: clean(meta.get("og:description") || meta.get("twitter:description") || meta.get("description") || "저장한 링크에서 더 자세한 내용을 확인해 보세요.", 500),
    thumbnail,
    // Preserve the actual destination instead of trusting an arbitrary og:url.
    url: pageUrl,
  };
}

function decodeHtml(buffer: Buffer, contentType: string): string {
  const declared = /charset\s*=\s*["']?([^\s;"'>]+)/i.exec(contentType)?.[1]
    ?? /<meta\b[^>]*charset\s*=\s*["']?([^\s;"'>/]+)/i.exec(buffer.subarray(0, 4096).toString("latin1"))?.[1]
    ?? "utf-8";
  try { return new TextDecoder(declared).decode(buffer); } catch { return buffer.toString("utf8"); }
}

type PageResult = { html: string; redirect?: never } | { redirect: string; html?: never };

async function readPage(url: URL, signal: AbortSignal): Promise<PageResult> {
  const address = await resolvePublicTarget(url, signal);
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const transport = url.protocol === "https:" ? https : http;
    const request = transport.get(url, {
      signal,
      agent: false,
      family: address.family,
      // The hostname remains intact for Host and TLS verification. No second DNS lookup.
      lookup: (_hostname, options, callback) => {
        if (options.all) callback(null, [address]);
        else callback(null, address.address, address.family);
      },
      headers: {
        "User-Agent": "OnebiteLink/1.0 (bookmark metadata preview)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Encoding": "gzip, deflate, br",
      },
    }, response => {
      response.on("error", reject);
      const status = response.statusCode ?? 0;
      if ([301, 302, 303, 307, 308].includes(status) && response.headers.location) {
        resolve({ redirect: response.headers.location });
        response.destroy();
        return;
      }
      if (status < 200 || status >= 300) {
        reject(new OpenGraphError("사이트에 접근하지 못했어요. 주소를 확인한 뒤 다시 시도해 주세요.", 502));
        response.destroy();
        return;
      }
      const contentType = response.headers["content-type"] ?? "";
      if (!/^(text\/html|application\/xhtml\+xml)(;|$)/i.test(contentType)) {
        reject(new OpenGraphError("웹페이지 주소를 입력해 주세요. 이 파일에서는 링크 정보를 가져올 수 없어요."));
        response.destroy();
        return;
      }
      const encoding = response.headers["content-encoding"]?.toLowerCase();
      const decoder = encoding === "gzip" ? createGunzip() : encoding === "deflate" ? createInflate() : encoding === "br" ? createBrotliDecompress() : null;
      const stream = decoder ? response.pipe(decoder) : response;
      const chunks: Buffer[] = [];
      let bytes = 0;
      let wireBytes = 0;
      function tooLarge() {
        reject(new OpenGraphError("페이지가 너무 커서 정보를 가져오지 못했어요."));
        response.destroy();
        decoder?.destroy();
      }
      response.on("data", (chunk: Buffer) => { wireBytes += chunk.length; if (wireBytes > MAX_BYTES) tooLarge(); });
      stream.on("data", (chunk: Buffer) => {
        bytes += chunk.length;
        if (bytes > MAX_BYTES) { tooLarge(); return; }
        chunks.push(chunk);
      });
      stream.on("error", reject);
      response.on("close", () => { if (!response.complete) decoder?.destroy(); });
      stream.on("end", () => resolve({ html: decodeHtml(Buffer.concat(chunks), contentType) }));
    });
    request.on("error", reject);
  });
}

export async function fetchOpenGraph(input: string, clientSignal?: AbortSignal): Promise<LinkMetadata> {
  let url: URL;
  try { url = new URL(normalizeLinkUrl(input)); } catch (cause) {
    throw new OpenGraphError(cause instanceof Error ? cause.message : "주소를 확인해 주세요.", 400);
  }
  const timeout = AbortSignal.timeout(10_000);
  const signal = clientSignal ? AbortSignal.any([clientSignal, timeout]) : timeout;
  try {
    for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects++) {
      const page = await readPage(url, signal);
      if (page.redirect !== undefined) {
        url = new URL(page.redirect, url);
        continue;
      }
      const metadata = extractMetadata(page.html, url.href);
      if (metadata.thumbnail) {
        try { await resolvePublicTarget(new URL(metadata.thumbnail), signal); } catch { metadata.thumbnail = null; }
      }
      return metadata;
    }
    throw new OpenGraphError("주소 이동이 너무 많아요. 최종 웹페이지 주소를 입력해 주세요.");
  } catch (cause) {
    if (cause instanceof OpenGraphError) throw cause;
    if (signal.aborted) throw new OpenGraphError("응답이 지연되고 있어요. 잠시 후 다시 시도해 주세요.", 504);
    throw new OpenGraphError("링크 정보를 가져오지 못했어요. 주소와 사이트 접속 상태를 확인해 주세요.", 502);
  }
}
