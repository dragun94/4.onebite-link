"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Bookmark, Folder } from "@/lib/bookmarks";
import { normalizeLinkUrl } from "@/lib/link-url";
import { linkColumns, toBookmark } from "@/lib/saved-links";
import { createClient } from "@/utils/supabase/client";
import Icon from "./icon";

export type LinkAction = { mode: "edit" | "delete"; bookmark: Bookmark };

type Props = {
  action: LinkAction;
  folders: Folder[];
  onSave: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

export default function LinkDialog({ action, folders, onSave, onDelete, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const submittingRef = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const { bookmark } = action;
  const deleting = action.mode === "delete";

  useEffect(() => { ref.current?.showModal(); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    const form = new FormData(event.currentTarget);
    submittingRef.current = true;
    setPending(true);
    setError("");
    try {
      const supabase = createClient();
      if (deleting) {
        const { error } = await supabase.from("links").delete().eq("id", bookmark.id).select("id").single();
        if (error) throw new Error("링크를 삭제하지 못했어요. 다시 시도해 주세요.");
        onDelete(bookmark.id);
      } else {
        const thumbnail = String(form.get("thumbnail") ?? "").trim();
        const { data, error } = await supabase.from("links").update({
          url: normalizeLinkUrl(String(form.get("url") ?? "")),
          title: String(form.get("title") ?? "").trim() || null,
          description: String(form.get("description") ?? "").trim() || null,
          thumbnail1_url: thumbnail ? normalizeLinkUrl(thumbnail) : null,
          folder_id: String(form.get("folder") ?? "") || null,
        }).eq("id", bookmark.id).select(linkColumns).single();
        if (error) throw new Error("링크를 수정하지 못했어요. 다시 시도해 주세요.");
        onSave(toBookmark(data));
      }
      ref.current?.close();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "요청을 처리하지 못했어요. 다시 시도해 주세요.");
    } finally {
      submittingRef.current = false;
      setPending(false);
    }
  }

  return (
    <dialog ref={ref} className="add-dialog" aria-labelledby="link-action-title" onClose={onClose} onCancel={event => { if (submittingRef.current) event.preventDefault(); }}>
      <div className="dialog-heading">
        <div><h2 id="link-action-title">{deleting ? "링크를 삭제할까요?" : "링크 수정"}</h2><p>{deleting ? "삭제한 링크는 되돌릴 수 없어요." : "링크 정보를 변경해 주세요."}</p></div>
        <button className="icon-button" aria-label="닫기" disabled={pending} onClick={() => ref.current?.close()}><Icon name="close" /></button>
      </div>
      <form onSubmit={submit} aria-busy={pending}>
        {deleting ? <p className="link-delete-title">{bookmark.title}</p> : <>
          <label>링크 주소<input name="url" defaultValue={bookmark.url} required autoFocus maxLength={4096} disabled={pending} /></label>
          <label>제목<input name="title" defaultValue={bookmark.title} disabled={pending} /></label>
          <label>설명<textarea name="description" defaultValue={bookmark.description} rows={3} disabled={pending} /></label>
          <label>썸네일 주소<input name="thumbnail" defaultValue={bookmark.thumbnail ?? ""} maxLength={4096} disabled={pending} /></label>
          <label>폴더<select name="folder" defaultValue={bookmark.folderId} disabled={pending}><option value="">미분류</option>{folders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}</select></label>
        </>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="dialog-actions">
          <button type="button" className="secondary-button" disabled={pending} autoFocus={deleting} onClick={() => ref.current?.close()}>취소</button>
          <button type="submit" className={deleting ? "danger-button" : "primary-button"} disabled={pending}>{pending ? "처리 중…" : deleting ? "삭제" : "저장"}</button>
        </div>
      </form>
    </dialog>
  );
}
