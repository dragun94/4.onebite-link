"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Folder } from "@/lib/bookmarks";
import Icon from "./icon";

export type FolderAction = { mode: "create" } | { mode: "rename" | "delete"; folder: Folder };

type Props = {
  action: FolderAction;
  folders: Folder[];
  linkCount: number;
  onConfirm: (name: string) => void;
  onClose: () => void;
};

export default function FolderDialog({ action, folders, linkCount, onConfirm, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(action.mode === "create" ? "" : action.folder.name);
  const [error, setError] = useState("");
  const deleting = action.mode === "delete";
  const title = deleting ? "폴더를 삭제할까요?" : action.mode === "create" ? "새 폴더 만들기" : "폴더 이름 변경";

  useEffect(() => {
    if (!ref.current?.open) ref.current?.showModal();
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!deleting) {
      if (!trimmed) { setError("폴더 이름을 입력해 주세요."); return; }
      if (folders.some(folder => folder.name.toLocaleLowerCase() === trimmed.toLocaleLowerCase() && (action.mode === "create" || folder.id !== action.folder.id))) {
        setError("같은 이름의 폴더가 있어요. 다른 이름을 입력해 주세요.");
        return;
      }
    }
    onConfirm(trimmed);
    ref.current?.close();
  }

  return (
    <dialog ref={ref} className="add-dialog folder-dialog" aria-labelledby="folder-dialog-title" aria-describedby="folder-dialog-description" onClose={onClose}>
      <div className="dialog-heading">
        <div><h2 id="folder-dialog-title">{title}</h2><p id="folder-dialog-description">{deleting ? "삭제한 폴더는 되돌릴 수 없어요." : "링크를 모아둘 공간에 이름을 붙여주세요."}</p></div>
        <button className="icon-button" aria-label="닫기" onClick={() => ref.current?.close()}><Icon name="close" /></button>
      </div>
      <form onSubmit={submit}>
        {deleting ? (
          <div className="folder-delete-summary"><strong>{action.folder.name}</strong><p>포함된 링크 {linkCount}개는 삭제되지 않고, ‘전체 링크’에 미분류로 남아요.</p></div>
        ) : (
          <label htmlFor="folder-name">폴더 이름<input id="folder-name" value={name} onChange={event => { setName(event.target.value); setError(""); }} placeholder="예: 다음 프로젝트 아이디어" maxLength={40} required autoFocus aria-invalid={!!error} aria-describedby={error ? "folder-name-error" : undefined} /></label>
        )}
        {error && <p id="folder-name-error" className="form-error" role="alert">{error}</p>}
        {!deleting && <p className="form-note">최대 40자 · 변경 사항은 현재 페이지를 이용하는 동안 유지됩니다.</p>}
        <div className="dialog-actions">
          <button type="button" className="secondary-button" autoFocus={deleting} onClick={() => ref.current?.close()}>취소</button>
          <button type="submit" className={deleting ? "danger-button" : "primary-button"}>{deleting ? "삭제" : action.mode === "rename" ? "적용" : "확인"}</button>
        </div>
      </form>
    </dialog>
  );
}
