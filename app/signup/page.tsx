import type { Metadata } from "next";
import AuthPage from "@/components/auth-page";

export const metadata: Metadata = { title: "회원가입 | 한입 링크" };

export default function SignupPage() {
  return <AuthPage mode="signup" />;
}
