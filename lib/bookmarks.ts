export type Folder = { id: string; name: string; color: string };

export const folders: Folder[] = [
  { id: "design", name: "디자인 영감", color: "#a38ae5" },
  { id: "development", name: "개발 자료", color: "#709cdd" },
  { id: "articles", name: "읽고 싶은 글", color: "#dfaa65" },
  { id: "tools", name: "유용한 도구", color: "#73ab92" },
];

export type Bookmark = {
  id: string;
  title: string;
  description: string;
  url: string;
  folderId: string;
  cover: string;
  brand: string;
  date: string;
};

export const initialBookmarks: Bookmark[] = [
  { id: "1", title: "감각적인 웹 디자인의 시작, Awwwards", description: "전 세계의 멋진 웹사이트를 만나고 새로운 디자인 영감을 발견해 보세요.", url: "https://www.awwwards.com", folderId: "design", cover: "awwwards", brand: "awwwards.", date: "2026-09-30" },
  { id: "2", title: "Next.js 공식 문서", description: "아이디어를 웹으로. React 프레임워크 Next.js의 개념부터 차근차근 알아보기.", url: "https://nextjs.org/docs", folderId: "development", cover: "next", brand: "NEXT.js", date: "2026-09-29" },
  { id: "3", title: "좋은 디자인을 위한 작은 발견들", description: "디자이너들의 다양한 시선과 작업에서 새로운 아이디어를 찾아보세요.", url: "https://www.behance.net", folderId: "design", cover: "design", brand: "Made to inspire.", date: "2026-09-28" },
  { id: "4", title: "생각을 정리하는 나만의 워크스페이스", description: "메모부터 프로젝트까지, 흩어진 생각을 한곳에 모으는 도구.", url: "https://www.notion.so", folderId: "tools", cover: "notion", brand: "Notion", date: "2026-09-27" },
  { id: "5", title: "더 나은 제품을 만드는 사람들의 이야기", description: "제품과 비즈니스, 그리고 성장에 관한 다양한 관점과 인사이트를 읽어보세요.", url: "https://brunch.co.kr", folderId: "articles", cover: "reading", brand: "A little pause,\na new perspective.", date: "2026-09-26" },
  { id: "6", title: "Figma — 아이디어를 함께 그리는 공간", description: "아이디어에서 프로토타입까지. 팀과 함께 더 좋은 디자인을 만들어 보세요.", url: "https://www.figma.com", folderId: "tools", cover: "figma", brand: "figma", date: "2026-09-25" },
];
