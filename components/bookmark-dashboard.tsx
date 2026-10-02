"use client";

import { useRef, useState } from "react";
import type { Bookmark, Folder } from "@/lib/bookmarks";
import { createClient } from "@/utils/supabase/client";
import Header from "./header";
import Sidebar from "./sidebar";
import BookmarkCard from "./bookmark-card";
import AddLinkDialog from "./add-link-dialog";
import Icon from "./icon";
import FolderDialog, { type FolderAction } from "./folder-dialog";
import LinkDialog, { type LinkAction } from "./link-dialog";

export default function BookmarkDashboard({ userId, initialFolders, initialBookmarks }: { userId: string; initialFolders: Folder[]; initialBookmarks: Bookmark[] }) {
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [folders, setFolders] = useState(initialFolders);
  const [folderAction, setFolderAction] = useState<FolderAction | null>(null);
  const [linkAction, setLinkAction] = useState<LinkAction | null>(null);
  const [selected, setSelected] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const visible = bookmarks.filter(item =>
    (selected === "all" || item.folderId === selected) &&
    `${item.title} ${item.description} ${item.url}`.toLowerCase().includes(query.trim().toLowerCase())
  ).sort((a, b) => sort === "name" ? a.title.localeCompare(b.title, "ko") : b.date.localeCompare(a.date));
  const title = selected === "all" ? "전체 링크" : folders.find(folder => folder.id === selected)?.name;

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError("");
    try {
      const { error } = await createClient().auth.signOut({ scope: "local" });
      if (error) {
        setLogoutError("로그아웃하지 못했어요. 다시 시도해 주세요.");
        return;
      }
      window.location.replace("/login");
    } catch {
      setLogoutError("로그아웃하지 못했어요. 인터넷 연결을 확인해 주세요.");
    } finally {
      setLoggingOut(false);
    }
  }

  async function confirmFolder(name: string) {
    if (!folderAction) return;
    if (folderAction.mode === "create") {
      const { data, error } = await createClient()
        .from("folders")
        .insert({ name })
        .select("id, name")
        .single();

      if (error) throw new Error("폴더를 추가하지 못했어요. 다시 시도해 주세요.");

      setFolders(items => [...items, { id: String(data.id), name: data.name, color: "#3182f6" }]);
    } else if (folderAction.mode === "rename") {
      const { data, error } = await createClient()
        .from("folders")
        .update({ name })
        .eq("id", folderAction.folder.id)
        .eq("user_id", userId)
        .select("id, name")
        .single();

      if (error) throw new Error("폴더 이름을 수정하지 못했어요. 다시 시도해 주세요.");

      setFolders(items => items.map(folder => folder.id === String(data.id) ? { ...folder, name: data.name } : folder));
    } else {
      const id = folderAction.folder.id;
      const { error } = await createClient()
        .from("folders")
        .delete()
        .eq("id", id)
        .eq("user_id", userId)
        .select("id")
        .single();

      if (error) throw new Error("폴더를 삭제하지 못했어요. 다시 시도해 주세요.");

      setFolders(items => items.filter(folder => folder.id !== id));
      setBookmarks(items => items.map(bookmark => bookmark.folderId === id ? { ...bookmark, folderId: "" } : bookmark));
      if (selected === id) setSelected("all");
    }
  }

  return (
    <div className="app-shell">
      {logoutError && <div role="alert" className="auth-toast">{logoutError}</div>}
      <Header onAdd={() => dialogRef.current?.showModal()} onAddFolder={() => setFolderAction({ mode: "create" })} />
      <div className="workspace">
        <Sidebar bookmarks={bookmarks} folders={folders} selected={selected} onSelect={setSelected} onRename={folder => setFolderAction({ mode: "rename", folder })} onDelete={folder => setFolderAction({ mode: "delete", folder })} onLogout={handleLogout} loggingOut={loggingOut} />
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
            {visible.length ? <div className="bookmark-grid">{visible.map(bookmark => <BookmarkCard key={bookmark.id} bookmark={bookmark} folder={folders.find(folder => folder.id === bookmark.folderId)} onEdit={() => setLinkAction({ mode: "edit", bookmark })} onDelete={() => setLinkAction({ mode: "delete", bookmark })} />)}</div> : <div className="empty-state"><Icon name="search" size={32} /><h2>{query ? "검색 결과가 없어요" : "아직 모아둔 링크가 없어요"}</h2><p>{query ? "다른 검색어로 다시 찾아보세요." : "새 링크를 추가해 이 폴더를 채워보세요."}</p></div>}
            <div className="collection-footer"><span />오늘의 발견이 내일의 영감이 되도록<span /></div>
          </section>
        </main>
      </div>
      <AddLinkDialog dialogRef={dialogRef} folders={folders} onAdd={bookmark => { setBookmarks(items => [bookmark, ...items]); setSelected("all"); setQuery(""); setSort("newest"); }} />
      {linkAction && <LinkDialog action={linkAction} folders={folders} userId={userId} onSave={saved => setBookmarks(items => items.map(item => item.id === saved.id ? saved : item))} onDelete={id => setBookmarks(items => items.filter(item => item.id !== id))} onClose={() => setLinkAction(null)} />}
      {folderAction && <FolderDialog action={folderAction} folders={folders} linkCount={folderAction.mode === "create" ? 0 : bookmarks.filter(bookmark => bookmark.folderId === folderAction.folder.id).length} onConfirm={confirmFolder} onClose={() => setFolderAction(null)} />}
    </div>
  );
}
