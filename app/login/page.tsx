import type { Metadata } from "next";
import AuthPage from "@/components/auth-page";

export const metadata: Metadata = { title: "로그인 | 한입 링크" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;
  return <AuthPage mode="login" oauthError={error === "kakao"} />;
}
