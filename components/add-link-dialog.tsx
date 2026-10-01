import { useRef, useState, type FormEvent, type RefObject } from "react";
import type { Bookmark, Folder } from "@/lib/bookmarks";
import Icon from "./icon";

type Props = { dialogRef: RefObject<HTMLDialogElement | null>; folders: Folder[]; onAdd: (bookmark: Bookmark) => void };

export default function AddLinkDialog({ dialogRef, folders, onAdd }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title")).trim();
    if (!title) { setError("링크 이름을 입력해 주세요."); return; }
    let url: URL;
    try {
      url = new URL(String(data.get("url")));
      if (!["https:", "http:"].includes(url.protocol)) throw new Error();
    } catch {
      setError("http:// 또는 https://로 시작하는 올바른 주소를 입력해 주세요.");
      return;
    }
    const today = new Date();
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    onAdd({ id: crypto.randomUUID(), title, url: url.href, description: String(data.get("description")).trim() || "새롭게 발견한 링크입니다.", folderId: String(data.get("folder")), date, cover: "custom", brand: url.hostname.replace(/^www\./, "") });
    dialogRef.current?.close();
  }

  return (
    <dialog ref={dialogRef} className="add-dialog" aria-labelledby="dialog-title" onClose={() => { formRef.current?.reset(); setError(""); }}>
      <div className="dialog-heading"><div><h2 id="dialog-title">새 링크 추가</h2><p>다시 만나고 싶은 링크를 저장하세요.</p></div><button className="icon-button" aria-label="닫기" onClick={() => dialogRef.current?.close()}><Icon name="close" /></button></div>
      <form ref={formRef} onSubmit={submit}>
        <label>링크 주소<input name="url" type="url" placeholder="https://example.com" required autoFocus /></label>
        <label>링크 이름<input name="title" placeholder="어떤 링크인가요?" maxLength={100} required /></label>
        <label>설명 <span className="optional">선택</span><textarea name="description" placeholder="기억해 두고 싶은 내용을 남겨보세요." maxLength={240} rows={3} /></label>
        <label>폴더<select name="folder">{folders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}<option value="">미분류</option></select></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <p className="form-note">추가한 링크는 현재 페이지를 이용하는 동안 유지됩니다.</p>
        <button type="submit" className="primary-button"><Icon name="plus" size={18} />링크 추가하기</button>
      </form>
    </dialog>
  );
}
