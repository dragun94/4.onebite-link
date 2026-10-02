import type { Metadata } from "next";
import AuthPage from "@/components/auth-page";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = createPageMetadata("회원가입", "한입 링크에 가입하고 나만의 링크 라이브러리를 시작하세요.", "/signup");

export default function SignupPage() {
  return <AuthPage mode="signup" />;
}
