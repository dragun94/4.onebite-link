"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/utils/supabase/client";
import Icon from "./icon";

type AuthPageProps = {
  mode: "login" | "signup";
};

export default function AuthPage({ mode }: AuthPageProps) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const canSubmit = Boolean(email.trim() && password.trim() && (!isSignup || confirmPassword.trim())) && !submitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setErrorMessage("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage("올바른 이메일 주소를 입력해 주세요.");
      return;
    }
    if (isSignup && password !== confirmPassword) {
      setErrorMessage("비밀번호가 일치하지 않아요.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data, error } = isSignup
        ? await supabase.auth.signUp({ email: email.trim(), password })
        : await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        const signupMessages: Record<string, string> = {
          email_address_invalid: "올바른 이메일 주소를 입력해 주세요.",
          email_exists: "이미 가입된 이메일이에요.",
          user_already_exists: "이미 가입된 이메일이에요.",
          weak_password: "비밀번호가 너무 짧거나 안전하지 않아요.",
          over_email_send_rate_limit: "요청이 너무 많아요. 잠시 후 다시 시도해 주세요.",
          signup_disabled: "현재 회원가입을 진행할 수 없어요.",
        };
        const loginMessages: Record<string, string> = {
          email_address_invalid: "올바른 이메일 주소를 입력해 주세요.",
          invalid_credentials: "이메일 또는 비밀번호가 올바르지 않아요.",
          email_not_confirmed: "이메일 인증을 완료한 뒤 로그인해 주세요.",
          over_request_rate_limit: "로그인 시도가 너무 많아요. 잠시 후 다시 시도해 주세요.",
        };
        const messages = isSignup ? signupMessages : loginMessages;
        setErrorMessage(messages[error.code ?? ""] ?? `${isSignup ? "회원가입" : "로그인"}에 실패했어요. 잠시 후 다시 시도해 주세요.`);
        return;
      }
      if (!isSignup && !data.session) {
        setErrorMessage("로그인에 실패했어요. 다시 시도해 주세요.");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setErrorMessage(`${isSignup ? "회원가입" : "로그인"}에 실패했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-dvh w-full items-center justify-center px-5 py-12">
      {errorMessage && (
        <div role="alert" className="fixed top-5 left-1/2 z-50 w-[calc(100%-40px)] max-w-[440px] -translate-x-1/2 rounded-xl bg-[var(--surface)] px-5 py-4 text-center text-sm font-semibold text-[var(--error)] shadow-[0_8px_30px_#191f2826]">
          {errorMessage}
        </div>
      )}
      <div className="w-full max-w-[440px]">
        <Link href="/" className="mb-9 flex w-fit items-center gap-2.5 text-[23px] font-extrabold tracking-[-1px] text-[var(--foreground)]">
          <span className="grid size-10 -rotate-6 place-items-center rounded-[13px] bg-[var(--accent)] text-white shadow-[0_4px_10px_#3182f626]">
            <Icon name="link" size={22} />
          </span>
          한입 링크<span className="-ml-2.5 text-[var(--accent)]">.</span>
        </Link>

        <section aria-labelledby="auth-title" className="rounded-2xl bg-[var(--surface)] p-6 shadow-[0_2px_8px_#191f2814] sm:p-9">
          <h1 id="auth-title" className="text-[26px] leading-[1.3] font-bold tracking-[-0.8px] text-[var(--foreground)]">
            {isSignup ? "회원가입" : "로그인"}
          </h1>
          <p className="mt-2 text-[15px] leading-[1.6] text-[var(--text-sub)]">
            {isSignup ? "한입 링크에서 나만의 링크를 모아보세요." : "모아둔 링크를 다시 만나보세요."}
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[var(--foreground)]">이메일</label>
              <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="이메일을 입력해 주세요" className="auth-input w-full rounded-xl bg-[var(--input-bg)] px-4 py-3.5 text-[16px] text-[var(--foreground)] outline-none placeholder:text-[var(--placeholder)]" />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[var(--foreground)]">비밀번호</label>
              <input id="password" name="password" type="password" autoComplete={isSignup ? "new-password" : "current-password"} value={password} onChange={event => setPassword(event.target.value)} placeholder="비밀번호를 입력해 주세요" className="auth-input w-full rounded-xl bg-[var(--input-bg)] px-4 py-3.5 text-[16px] text-[var(--foreground)] outline-none placeholder:text-[var(--placeholder)]" />
            </div>
            {isSignup && (
              <div>
                <label htmlFor="confirm-password" className="mb-2 block text-sm font-semibold text-[var(--foreground)]">비밀번호 확인</label>
                <input id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} placeholder="비밀번호를 다시 입력해 주세요" className="auth-input w-full rounded-xl bg-[var(--input-bg)] px-4 py-3.5 text-[16px] text-[var(--foreground)] outline-none placeholder:text-[var(--placeholder)]" />
              </div>
            )}
            <button type="submit" disabled={!canSubmit} className="auth-submit mt-2 w-full rounded-xl bg-[var(--accent)] px-5 py-3.5 text-[17px] font-bold text-white">
              {submitting ? (isSignup ? "회원가입 중..." : "로그인 중...") : isSignup ? "회원가입" : "로그인"}
            </button>
          </form>

          {!isSignup && (
            <div className="mt-4 text-right text-sm">
              <Link href="/forgot-password" className="auth-link font-semibold text-[var(--accent)]">비밀번호를 잊으셨나요?</Link>
            </div>
          )}

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[var(--text-sub)]">
            <span>{isSignup ? "이미 계정이 있으신가요?" : "아직 계정이 없으신가요?"}</span>
            <Link href={isSignup ? "/login" : "/signup"} className="auth-link font-semibold text-[var(--accent)]">
              {isSignup ? "로그인" : "회원가입"}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
