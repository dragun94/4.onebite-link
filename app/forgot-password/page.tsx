import type { Metadata } from "next";
import PasswordRecovery from "@/components/password-recovery";

export const metadata: Metadata = { title: "비밀번호 찾기 | 한입 링크" };

export default function ForgotPasswordPage() {
  return <PasswordRecovery mode="request" />;
}
