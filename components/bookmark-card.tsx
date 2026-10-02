"use client";

import { useState } from "react";
import Image from "next/image";
import type { Bookmark, Folder } from "@/lib/bookmarks";
import Icon from "./icon";

export default function BookmarkCard({ bookmark, folder }: { bookmark: Bookmark; folder?: Folder }) {
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
          <div className="card-footer"><span className={`folder-badge folder-${bookmark.folderId}`}><Icon name="folder" size={13} /><span>{folder?.name ?? "미분류"}</span></span><time dateTime={bookmark.date}>{bookmark.date.replaceAll("-", ".")}</time></div>
        </div>
      </a>
    </article>
  );
}
