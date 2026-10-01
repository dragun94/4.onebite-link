"use client";

import { useRef, useState } from "react";
import { folders as initialFolders, initialBookmarks } from "@/lib/bookmarks";
import Header from "./header";
import Sidebar from "./sidebar";
import BookmarkCard from "./bookmark-card";
import AddLinkDialog from "./add-link-dialog";
import Icon from "./icon";
import FolderDialog, { type FolderAction } from "./folder-dialog";

export default function BookmarkDashboard() {
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [folders, setFolders] = useState(initialFolders);
  const [folderAction, setFolderAction] = useState<FolderAction | null>(null);
  const [selected, setSelected] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const visible = bookmarks.filter(item =>
    (selected === "all" || item.folderId === selected) &&
    `${item.title} ${item.description} ${item.url}`.toLowerCase().includes(query.trim().toLowerCase())
  ).sort((a, b) => sort === "name" ? a.title.localeCompare(b.title, "ko") : b.date.localeCompare(a.date));
  const title = selected === "all" ? "전체 링크" : folders.find(folder => folder.id === selected)?.name;

  function confirmFolder(name: string) {
    if (!folderAction) return;
    if (folderAction.mode === "create") {
      setFolders(items => [...items, { id: crypto.randomUUID(), name, color: "#3182f6" }]);
    } else if (folderAction.mode === "rename") {
      setFolders(items => items.map(folder => folder.id === folderAction.folder.id ? { ...folder, name } : folder));
    } else {
      const id = folderAction.folder.id;
      setFolders(items => items.filter(folder => folder.id !== id));
      setBookmarks(items => items.map(bookmark => bookmark.folderId === id ? { ...bookmark, folderId: "" } : bookmark));
      if (selected === id) setSelected("all");
    }
  }

  return (
    <div className="app-shell">
      <Header onAdd={() => dialogRef.current?.showModal()} onAddFolder={() => setFolderAction({ mode: "create" })} />
      <div className="workspace">
        <Sidebar bookmarks={bookmarks} folders={folders} selected={selected} onSelect={setSelected} onRename={folder => setFolderAction({ mode: "rename", folder })} onDelete={folder => setFolderAction({ mode: "delete", folder })} />
        <main className="main-content">
          <div className="breadcrumb">내 라이브러리<span>/</span>{title}</div>
          <section aria-labelledby="page-title">
            <div className="page-heading">
              <div><div className="eyebrow">SAVE A LITTLE. INSPIRE A LOT.</div><h1 id="page-title">{title}<span className="title-dot">.</span></h1><p>좋은 발견을 모아, 나만의 영감으로.</p><div className="collection-summary"><span><Icon name="link" size={14} />{bookmarks.length}개의 발견</span><span><Icon name="folder" size={14} />{folders.length}개의 폴더</span></div></div>
              <div className="collection-art" aria-hidden="true"><div className="art-card art-card-back"><Icon name="link" size={32} /></div><div className="art-card art-card-front"><Icon name="bookmark" size={38} /><i /><i /></div><span className="art-spark">✦</span></div>
            </div>
            <div className="toolbar">
              <div className="result-count">소중히 모은 링크 <strong aria-live="polite">{visible.length}</strong></div>
              <div className="toolbar-controls">
                <label className="search-box"><Icon name="search" size={17} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="링크 검색" aria-label="링크 검색" />{query && <button aria-label="검색어 지우기" onClick={() => setQuery("")}><Icon name="close" size={14} /></button>}</label>
                <select aria-label="링크 정렬" value={sort} onChange={event => setSort(event.target.value)}><option value="newest">최신순</option><option value="name">이름순</option></select>
              </div>
            </div>
            {visible.length ? <div className="bookmark-grid">{visible.map(bookmark => <BookmarkCard key={bookmark.id} bookmark={bookmark} folder={folders.find(folder => folder.id === bookmark.folderId)} />)}</div> : <div className="empty-state"><Icon name="search" size={32} /><h2>{query ? "검색 결과가 없어요" : "아직 모아둔 링크가 없어요"}</h2><p>{query ? "다른 검색어로 다시 찾아보세요." : "새 링크를 추가해 이 폴더를 채워보세요."}</p></div>}
            <div className="collection-footer"><span />오늘의 발견이 내일의 영감이 되도록<span /></div>
          </section>
        </main>
      </div>
      <AddLinkDialog dialogRef={dialogRef} folders={folders} onAdd={bookmark => { setBookmarks(items => [bookmark, ...items]); setSelected("all"); setQuery(""); setSort("newest"); }} />
      {folderAction && <FolderDialog action={folderAction} folders={folders} linkCount={folderAction.mode === "create" ? 0 : bookmarks.filter(bookmark => bookmark.folderId === folderAction.folder.id).length} onConfirm={confirmFolder} onClose={() => setFolderAction(null)} />}
    </div>
  );
}
