import { fetchOpenGraph, OpenGraphError } from "./opengraph.ts";

export async function handleOpenGraph(request: Request) {
  try {
    // Bound the request body even when Content-Length is omitted.
    const reader = request.body?.getReader();
    if (!reader) return Response.json({ error: "링크 주소를 입력해 주세요." }, { status: 400 });
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 16_384) {
        await reader.cancel();
        return Response.json({ error: "링크 주소가 너무 길어요." }, { status: 413 });
      }
      chunks.push(value);
    }
    let body: unknown;
    try { body = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch {
      return Response.json({ error: "요청 형식을 확인해 주세요." }, { status: 400 });
    }
    if (!body || typeof body !== "object" || !("url" in body) || typeof body.url !== "string") {
      return Response.json({ error: "링크 주소를 입력해 주세요." }, { status: 400 });
    }
    const metadata = await fetchOpenGraph(body.url, request.signal);
    return Response.json(metadata, { headers: { "Cache-Control": "no-store" } });
  } catch (cause) {
    if (cause instanceof OpenGraphError) return Response.json({ error: cause.message }, { status: cause.status });
    return Response.json({ error: "링크 정보를 가져오지 못했어요. 다시 시도해 주세요." }, { status: 500 });
  }
}
