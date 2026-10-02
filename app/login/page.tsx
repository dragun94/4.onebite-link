import type { Metadata } from "next";
import AuthPage from "@/components/auth-page";

export const metadata: Metadata = { title: "로그인 | 한입 링크" };

export default function LoginPage() {
  return <AuthPage mode="login" />;
}
