"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { createClient } from "@/utils/supabase/client";
import Icon from "./icon";

type Props = { mode: "request"; canReset?: never } | { mode: "reset"; canReset: boolean };

export default function PasswordRecovery({ mode, canReset }: Props) {
  const isRequest = mode === "request";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const canSubmit = isRequest
    ? Boolean(email.trim()) && !pending
    : Boolean(password.trim() && confirmation.trim()) && !pending;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setErrorMessage("");

    if (isRequest && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage("올바른 이메일 주소를 입력해 주세요.");
      return;
    }
    if (!isRequest && password !== confirmation) {
      setErrorMessage("비밀번호가 일치하지 않아요.");
      return;
    }

    setPending(true);
    try {
      const supabase = createClient();
      if (isRequest) {
        const redirectTo = new URL("/auth/recovery", window.location.origin).toString();
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
        if (error) {
          const messages: Record<string, string> = {
            email_address_invalid: "올바른 이메일 주소를 입력해 주세요.",
            over_email_send_rate_limit: "요청이 너무 많아요. 잠시 후 다시 시도해 주세요.",
            email_provider_disabled: "현재 이메일 발송을 사용할 수 없어요.",
          };
          setErrorMessage(messages[error.code ?? ""] ?? "이메일을 보내지 못했어요. 잠시 후 다시 시도해 주세요.");
          return;
        }
      } else {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          const messages: Record<string, string> = {
            weak_password: "비밀번호가 너무 짧거나 안전하지 않아요.",
            same_password: "이전에 사용한 비밀번호와 다른 비밀번호를 입력해 주세요.",
            session_not_found: "재설정 링크가 만료되었어요. 다시 요청해 주세요.",
          };
          setErrorMessage(messages[error.code ?? ""] ?? "비밀번호를 변경하지 못했어요. 다시 시도해 주세요.");
          return;
        }
        try { await supabase.auth.signOut({ scope: "local" }); } catch { /* The password was already changed. */ }
      }
      setComplete(true);
    } catch {
      setErrorMessage(isRequest ? "이메일을 보내지 못했어요. 인터넷 연결을 확인해 주세요." : "비밀번호를 변경하지 못했어요. 인터넷 연결을 확인해 주세요.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-dvh w-full items-center justify-center px-5 py-12">
      {errorMessage && <div role="alert" className="auth-toast">{errorMessage}</div>}
      <div className="w-full max-w-[440px]">
        <Link href="/" className="mb-9 flex w-fit items-center gap-2.5 text-[23px] font-extrabold tracking-[-1px] text-[var(--foreground)]">
          <span className="grid size-10 -rotate-6 place-items-center rounded-[13px] bg-[var(--accent)] text-white shadow-[0_4px_10px_#3182f626]"><Icon name="link" size={22} /></span>
          한입 링크<span className="-ml-2.5 text-[var(--accent)]">.</span>
        </Link>

        <section aria-labelledby="recovery-title" className="rounded-2xl bg-[var(--surface)] p-6 shadow-[0_2px_8px_#191f2814] sm:p-9">
          <h1 id="recovery-title" className="text-[26px] leading-[1.3] font-bold tracking-[-0.8px] text-[var(--foreground)]">
            {isRequest ? "비밀번호 찾기" : "비밀번호 재설정"}
          </h1>
          {complete ? (
            <>
              <p className="mt-4 text-[15px] leading-[1.7] text-[var(--text-sub)]">
                {isRequest ? "입력한 이메일로 재설정 링크를 보냈어요. 메일함을 확인해 주세요." : "비밀번호가 변경되었어요. 새 비밀번호로 로그인해 주세요."}
              </p>
              <Link href="/login" className="auth-submit mt-8 flex w-full items-center justify-center rounded-xl bg-[var(--accent)] px-5 py-3.5 text-[17px] font-bold text-white">로그인으로 이동</Link>
            </>
          ) : !isRequest && !canReset ? (
            <>
              <p className="mt-4 text-[15px] leading-[1.7] text-[var(--text-sub)]">재설정 링크가 유효하지 않거나 만료되었어요. 새 링크를 요청해 주세요.</p>
              <Link href="/forgot-password" className="auth-submit mt-8 flex w-full items-center justify-center rounded-xl bg-[var(--accent)] px-5 py-3.5 text-[17px] font-bold text-white">새 링크 요청하기</Link>
            </>
          ) : (
            <>
              <p className="mt-2 text-[15px] leading-[1.6] text-[var(--text-sub)]">
                {isRequest ? "가입한 이메일을 입력하면 재설정 링크를 보내드릴게요." : "새 비밀번호를 입력해 주세요."}
              </p>
              <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
                {isRequest ? (
                  <div>
                    <label htmlFor="recovery-email" className="mb-2 block text-sm font-semibold text-[var(--foreground)]">이메일</label>
                    <input id="recovery-email" name="email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="이메일을 입력해 주세요" className="auth-input w-full rounded-xl bg-[var(--input-bg)] px-4 py-3.5 text-[16px] text-[var(--foreground)] outline-none placeholder:text-[var(--placeholder)]" />
                  </div>
                ) : (
                  <>
                    <div>
                      <label htmlFor="new-password" className="mb-2 block text-sm font-semibold text-[var(--foreground)]">새 비밀번호</label>
                      <input id="new-password" name="password" type="password" autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="새 비밀번호를 입력해 주세요" className="auth-input w-full rounded-xl bg-[var(--input-bg)] px-4 py-3.5 text-[16px] text-[var(--foreground)] outline-none placeholder:text-[var(--placeholder)]" />
                    </div>
                    <div>
                      <label htmlFor="new-password-confirmation" className="mb-2 block text-sm font-semibold text-[var(--foreground)]">새 비밀번호 확인</label>
                      <input id="new-password-confirmation" name="password-confirmation" type="password" autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} placeholder="새 비밀번호를 다시 입력해 주세요" className="auth-input w-full rounded-xl bg-[var(--input-bg)] px-4 py-3.5 text-[16px] text-[var(--foreground)] outline-none placeholder:text-[var(--placeholder)]" />
                    </div>
                  </>
                )}
                <button type="submit" disabled={!canSubmit} className="auth-submit mt-2 w-full rounded-xl bg-[var(--accent)] px-5 py-3.5 text-[17px] font-bold text-white">
                  {pending ? "처리 중..." : isRequest ? "재설정 링크 보내기" : "비밀번호 변경하기"}
                </button>
              </form>
              {isRequest && <div className="mt-6 text-center text-sm"><Link href="/login" className="auth-link font-semibold text-[var(--accent)]">로그인으로 돌아가기</Link></div>}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
