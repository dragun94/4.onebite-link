import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import type { Bookmark, Folder } from "@/lib/bookmarks";
import { normalizeLinkUrl, type LinkMetadata } from "@/lib/link-url";
import { createClient } from "@/utils/supabase/client";
import { linkColumns, toBookmark } from "@/lib/saved-links";
import Icon from "./icon";

type Props = { dialogRef: RefObject<HTMLDialogElement | null>; folders: Folder[]; onAdd: (bookmark: Bookmark) => void };

export default function AddLinkDialog({ dialogRef, folders, onAdd }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => () => requestRef.current?.abort(), []);

  function cancelRequest() {
    requestRef.current?.abort();
    requestRef.current = null;
    setLoading(false);
  }

  function close() {
    if (requestRef.current) return;
    cancelRequest();
    dialogRef.current?.close();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestRef.current) return;
    const data = new FormData(event.currentTarget);
    let url: string;
    try {
      url = normalizeLinkUrl(address);
      setAddress(url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "주소를 확인해 주세요.");
      return;
    }

    const controller = new AbortController();
    requestRef.current = controller;
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/opengraph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "링크 정보를 불러오지 못했어요. 다시 시도해 주세요.");
      if (controller.signal.aborted || requestRef.current !== controller) return;
      const metadata: LinkMetadata = result;
      const folderId = String(data.get("folder") ?? "");
      const { data: savedLink, error: saveError } = await createClient()
        .from("links")
        .insert({
          url: metadata.url,
          title: metadata.title,
          description: metadata.description,
          thumbnail1_url: metadata.thumbnail,
          folder_id: folderId || null,
        })
        .select(linkColumns)
        .single();

      if (saveError) throw new Error("링크를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");

      onAdd(toBookmark(savedLink));
      dialogRef.current?.close();
    } catch (cause) {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "링크 정보를 불러오지 못했어요. 다시 시도해 주세요.");
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setLoading(false);
      }
    }
  }

  return (
    <dialog ref={dialogRef} className="add-dialog" aria-labelledby="dialog-title" onCancel={event => { if (requestRef.current) event.preventDefault(); }} onClose={() => { cancelRequest(); formRef.current?.reset(); setAddress(""); setError(""); }}>
      <div className="dialog-heading"><div><h2 id="dialog-title">새 링크 추가</h2><p>주소만 넣으면 제목과 이미지를 가져와요.</p></div><button className="icon-button" aria-label="닫기" disabled={loading} onClick={close}><Icon name="close" /></button></div>
      <form ref={formRef} onSubmit={submit} aria-busy={loading}>
        <label>링크 주소<input name="url" type="text" inputMode="url" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="naver.com 또는 https://example.com" required autoFocus maxLength={4096} value={address} disabled={loading} onChange={event => { setAddress(event.target.value); setError(""); }} onBlur={() => { if (address.trim()) { try { setAddress(normalizeLinkUrl(address)); } catch { /* Validation is shown on submit. */ } } }} aria-invalid={!!error} aria-describedby={error ? "link-error" : "link-help"} /></label>
        <p id="link-help" className="form-note">https://는 자동으로 채워드려요. 제목·설명·썸네일은 링크에서 가져옵니다.</p>
        <label>폴더<select name="folder" disabled={loading}>{folders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}<option value="">미분류</option></select></label>
        {error && <p id="link-error" className="form-error" role="alert">{error}</p>}
        {loading && <p className="link-loading" role="status"><span className="loading-spinner" aria-hidden="true" />링크 정보를 가져와 저장하고 있어요…</p>}
        <div className="dialog-actions"><button type="button" className="secondary-button" disabled={loading} onClick={close}>취소</button><button type="submit" className="primary-button" disabled={loading}>{loading ? "저장 중…" : error ? "다시 시도" : "확인"}</button></div>
      </form>
    </dialog>
  );
}
