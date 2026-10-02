import BookmarkDashboard from "@/components/bookmark-dashboard";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { linkColumns, toBookmark } from "@/lib/saved-links";

export default async function Home() {
  const supabase = createClient(await cookies());
  const [folderResult, linkResult] = await Promise.all([
    supabase.from("folders").select("id, name")
      .order("created_at", { ascending: true }).order("id", { ascending: true }),
    supabase.from("links").select(linkColumns)
      .order("created_at", { ascending: false }).order("id", { ascending: false }),
  ]);

  if (folderResult.error) throw new Error("폴더 목록을 불러오지 못했습니다.", { cause: folderResult.error });
  if (linkResult.error) throw new Error("링크 목록을 불러오지 못했습니다.", { cause: linkResult.error });

  const folders = folderResult.data.map(folder => ({
    id: String(folder.id), name: folder.name, color: "#3182f6",
  }));

  return <BookmarkDashboard initialFolders={folders} initialBookmarks={linkResult.data.map(toBookmark)} />;
}
