"use client";

import { useState } from "react";
import Image from "next/image";
import type { Bookmark, Folder } from "@/lib/bookmarks";
import Icon from "./icon";

export default function BookmarkCard({ bookmark, folder, onEdit, onDelete }: { bookmark: Bookmark; folder?: Folder; onEdit: () => void; onDelete: () => void }) {
  const domain = new URL(bookmark.url).hostname.replace(/^www\./, "");
  const [failedImage, setFailedImage] = useState<string | null>(null);
  return (
    <article className="bookmark-card">
      <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="card-link" aria-label={`${bookmark.title} (새 탭)`}>
        <div className={`card-cover cover-${bookmark.cover}`}>
          <span className="cover-orbit" aria-hidden="true" /><span className="cover-brand">{bookmark.brand}</span>
          <span className="cover-caption">{bookmark.cover === "next" ? "The React Framework for the Web" : bookmark.cover === "design" ? "A COLLECTION OF CREATIVE IDEAS" : bookmark.cover === "reading" ? "THOUGHTS & STORIES" : ""}</span>
          {bookmark.thumbnail && failedImage !== bookmark.thumbnail && <Image src={bookmark.thumbnail} alt="" fill unoptimized className="card-thumbnail" referrerPolicy="no-referrer" onError={() => setFailedImage(bookmark.thumbnail ?? null)} />}
          <span className="open-link"><Icon name="arrow" size={17} /></span>
        </div>
        <div className="card-content">
          <div className="card-domain"><span className={`favicon favicon-${bookmark.cover}`}>{domain.charAt(0).toUpperCase()}</span>{domain}</div>
          <h2>{bookmark.title}</h2><p>{bookmark.description}</p>
          <div className="card-footer"><span className={`folder-badge folder-${bookmark.folderId}`}><Icon name="folder" size={13} /><span>{folder?.name ?? "미분류"}</span></span><time dateTime={bookmark.date}>{bookmark.date.slice(0, 10).replaceAll("-", ".")}</time></div>
        </div>
      </a>
      <div className="link-card-actions">
        <button type="button" className="icon-button" onClick={onEdit} aria-label={`${bookmark.title} 수정`} title="링크 수정"><Icon name="edit" size={18} /></button>
        <button type="button" className="icon-button delete-action" onClick={onDelete} aria-label={`${bookmark.title} 삭제`} title="링크 삭제"><Icon name="trash" size={18} /></button>
      </div>
    </article>
  );
}
