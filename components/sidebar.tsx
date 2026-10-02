import type { Bookmark, Folder } from "@/lib/bookmarks";
import Icon from "./icon";

type Props = { bookmarks: Bookmark[]; folders: Folder[]; selected: string; onSelect: (id: string) => void; onRename: (folder: Folder) => void; onDelete: (folder: Folder) => void; onLogout: () => void; loggingOut: boolean };

export default function Sidebar({ bookmarks, folders, selected, onSelect, onRename, onDelete, onLogout, loggingOut }: Props) {
  return (
    <aside className="sidebar">
      <div className="workspace-label">MY WORKSPACE</div>
      <nav aria-label="링크 폴더">
        <button className={`nav-item ${selected === "all" ? "active" : ""}`} onClick={() => onSelect("all")} aria-current={selected === "all" ? "page" : undefined}>
          <Icon name="grid" size={18} /><span>전체 링크</span><span className="count">{bookmarks.length}</span>
        </button>
        <div className="folder-label">내 폴더<span>{folders.length}</span></div>
        <div className="folder-list">
          {folders.map(folder => (
            <div key={folder.id} className={`folder-row ${selected === folder.id ? "selected" : ""}`}>
              <button className={`nav-item ${selected === folder.id ? "active" : ""}`} onClick={() => onSelect(folder.id)} aria-current={selected === folder.id ? "page" : undefined}>
                <span className={`folder-icon folder-${folder.id}`}><Icon name="folder" size={19} /></span><span className="folder-name" title={folder.name}>{folder.name}</span><span className="count">{bookmarks.filter(item => item.folderId === folder.id).length}</span>
              </button>
              <div className="folder-actions">
                <button className="folder-action" onClick={() => onRename(folder)} aria-label={`${folder.name} 이름 변경`} title="이름 변경"><Icon name="edit" size={15} /></button>
                <button className="folder-action delete-action" onClick={() => onDelete(folder)} aria-label={`${folder.name} 삭제`} title="폴더 삭제"><Icon name="trash" size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      </nav>
      <div className="sidebar-note"><span className="note-icon"><Icon name="bookmark" /></span><strong>발견의 순간을, 한입에.</strong><p>다시 보고 싶은 링크를 모아<br />나만의 영감으로 채워보세요.</p><span className="note-decoration" aria-hidden="true">✳</span></div>
      <div className="sidebar-footer"><span className="status-dot" />나만의 작은 링크 라이브러리</div>
      <button type="button" className="sidebar-logout" onClick={onLogout} disabled={loggingOut}>
        <Icon name="logout" size={18} />{loggingOut ? "로그아웃 중..." : "로그아웃"}
      </button>
    </aside>
  );
}
