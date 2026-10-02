import type { Metadata } from "next";

export const siteName = "한입 링크";
export const siteDescription = "다시 보고 싶은 링크를 모으고 폴더별로 정리하는 나만의 링크 라이브러리.";

export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
);

export function createPageMetadata(
  title: string,
  description: string,
  pathname: string,
  robots?: Metadata["robots"],
): Metadata {
  const fullTitle = pathname === "/" ? `${siteName} — 나만의 링크 라이브러리` : `${title} | ${siteName}`;

  return {
    title: fullTitle,
    description,
    alternates: { canonical: pathname },
    openGraph: {
      title: fullTitle,
      description,
      url: pathname,
      siteName,
      locale: "ko_KR",
      type: "website",
      images: [{ url: "/thumbnail.png", width: 2400, height: 1260, alt: `${siteName} 미리보기` }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: ["/thumbnail.png"],
    },
    ...(robots ? { robots } : {}),
  };
}
