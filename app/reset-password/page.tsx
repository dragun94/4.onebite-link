import type { Metadata } from "next";
import { cookies } from "next/headers";
import PasswordRecovery from "@/components/password-recovery";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = { title: "비밀번호 재설정 | 한입 링크" };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { invalid } = await searchParams;
  const supabase = createClient(await cookies());
  const { data, error } = await supabase.auth.getClaims();
  return <PasswordRecovery mode="reset" canReset={!invalid && !error && Boolean(data?.claims)} />;
}
