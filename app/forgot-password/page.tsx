import type { Metadata } from "next";
import PasswordRecovery from "@/components/password-recovery";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = createPageMetadata("비밀번호 찾기", "한입 링크 계정의 비밀번호 재설정 방법을 안내합니다.", "/forgot-password", { index: false, follow: false });

export default function ForgotPasswordPage() {
  return <PasswordRecovery mode="request" />;
}
