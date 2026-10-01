import { folders, type Bookmark } from "@/lib/bookmarks";
import Icon from "./icon";

export default function BookmarkCard({ bookmark }: { bookmark: Bookmark }) {
  const folder = folders.find(item => item.id === bookmark.folderId);
  const domain = new URL(bookmark.url).hostname.replace(/^www\./, "");
  return (
    <article className="bookmark-card">
      <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="card-link" aria-label={`${bookmark.title} (새 탭)`}>
        <div className={`card-cover cover-${bookmark.cover}`}>
          <span className="cover-orbit" aria-hidden="true" /><span className="cover-brand">{bookmark.brand}</span>
          <span className="cover-caption">{bookmark.cover === "next" ? "The React Framework for the Web" : bookmark.cover === "design" ? "A COLLECTION OF CREATIVE IDEAS" : bookmark.cover === "reading" ? "THOUGHTS & STORIES" : ""}</span>
          <span className="open-link"><Icon name="arrow" size={17} /></span>
        </div>
        <div className="card-content">
          <div className="card-domain"><span className={`favicon favicon-${bookmark.cover}`}>{domain.charAt(0).toUpperCase()}</span>{domain}</div>
          <h2>{bookmark.title}</h2><p>{bookmark.description}</p>
          <div className="card-footer"><span className={`folder-badge folder-${bookmark.folderId}`}><Icon name="folder" size={13} />{folder?.name}</span><time dateTime={bookmark.date}>{bookmark.date.replaceAll("-", ".")}</time></div>
        </div>
      </a>
    </article>
  );
}
