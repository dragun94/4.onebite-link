import type { Metadata } from "next";
import AuthPage from "@/components/auth-page";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = createPageMetadata("로그인", "한입 링크에 로그인하여 저장한 링크와 폴더를 관리하세요.", "/login");

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;
  return <AuthPage mode="login" oauthError={error === "kakao"} />;
}
