import type { Metadata } from "next";
import { cookies } from "next/headers";
import PasswordRecovery from "@/components/password-recovery";
import { createClient } from "@/utils/supabase/server";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = createPageMetadata("비밀번호 재설정", "한입 링크 계정의 비밀번호를 새로 설정합니다.", "/reset-password", { index: false, follow: false });

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { invalid } = await searchParams;
  const supabase = createClient(await cookies());
  const { data, error } = await supabase.auth.getClaims();
  return <PasswordRecovery mode="reset" canReset={!invalid && !error && Boolean(data?.claims)} />;
}
