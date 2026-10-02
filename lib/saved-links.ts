import type { Bookmark } from "./bookmarks";

export const linkColumns = "id, url, title, description, thumbnail1_url, folder_id, created_at";

type SavedLink = {
  id: number;
  url: string;
  title: string | null;
  description: string | null;
  thumbnail1_url: string | null;
  folder_id: number | null;
  created_at: string;
};

export function toBookmark(link: SavedLink): Bookmark {
  return {
    id: String(link.id),
    url: link.url,
    title: link.title || link.url,
    description: link.description ?? "",
    thumbnail: link.thumbnail1_url,
    folderId: link.folder_id === null ? "" : String(link.folder_id),
    date: link.created_at,
    cover: "custom",
    brand: new URL(link.url).hostname.replace(/^www\./, ""),
  };
}
