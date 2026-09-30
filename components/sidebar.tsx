import { folders, type Bookmark } from "@/lib/bookmarks";
import Icon from "./icon";

type Props = { bookmarks: Bookmark[]; selected: string; onSelect: (id: string) => void };

export default function Sidebar({ bookmarks, selected, onSelect }: Props) {
  return (
    <aside className="sidebar">
      <div className="workspace-label">MY WORKSPACE</div>
      <nav aria-label="링크 폴더">
        <button className={`nav-item ${selected === "all" ? "active" : ""}`} onClick={() => onSelect("all")} aria-current={selected === "all" ? "page" : undefined}>
          <Icon name="grid" size={18} /><span>All <span className="all-description">전체 링크</span></span><span className="count">{bookmarks.length}</span>
        </button>
        <div className="folder-label">내 폴더<span>{folders.length}</span></div>
        <div className="folder-list">
          {folders.map(folder => (
            <button key={folder.id} className={`nav-item ${selected === folder.id ? "active" : ""}`} onClick={() => onSelect(folder.id)} aria-current={selected === folder.id ? "page" : undefined}>
              <Icon name="folder" size={19} style={{ color: folder.color }} /><span>{folder.name}</span><span className="count">{bookmarks.filter(item => item.folderId === folder.id).length}</span>
            </button>
          ))}
        </div>
      </nav>
      <div className="sidebar-note"><span className="note-icon"><Icon name="bookmark" /></span><strong>발견의 순간을, 한입에.</strong><p>다시 보고 싶은 링크를 모아<br />나만의 영감으로 채워보세요.</p><span className="note-decoration" aria-hidden="true">✳</span></div>
      <div className="sidebar-footer"><span className="status-dot" />나만의 작은 링크 라이브러리</div>
    </aside>
  );
}
