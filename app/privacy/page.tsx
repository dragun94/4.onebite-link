import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = createPageMetadata(
  "개인정보 처리방침",
  "한입 링크의 개인정보 수집, 이용, 보유 및 보호 방법을 안내합니다.",
  "/privacy",
  { index: true, follow: true },
);

const serviceName = "한입 링크";
const operatorName = "한입링크";
const contactEmail = "helley11@naver.com";
const sections = [
  "개인정보의 처리 목적",
  "처리하는 개인정보의 항목",
  "개인정보의 처리 및 보유 기간",
  "개인정보의 파기 절차 및 방법",
  "개인정보 처리업무의 위탁",
  "정보주체의 권리와 행사 방법",
  "개인정보의 안전성 확보 조치",
  "쿠키의 사용 및 거부 방법",
  "개인정보 보호책임자",
  "권익침해 구제방법",
  "처리방침의 변경",
];

export default function PrivacyPage() {
  const effectiveDate = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-12 text-[var(--foreground)] sm:py-16">
      <Link href="/" className="mb-8 inline-block text-sm font-semibold text-[var(--accent)] hover:underline">← 한입 링크</Link>
      <article className="rounded-2xl bg-white px-6 py-9 shadow-[0_2px_8px_#191f2814] sm:px-10 sm:py-12">
        <header className="border-b border-[#e5e8eb] pb-7">
          <h1 className="text-3xl font-bold">개인정보 처리방침</h1>
          <p className="mt-3 text-sm text-[var(--text-sub)]">시행일: <time dateTime={effectiveDate}>{effectiveDate}</time></p>
        </header>

        <p className="mt-8 leading-7 text-[#4e5968]">
          {operatorName}(이하 “운영자”)는 {serviceName} 서비스 이용자의 개인정보를 안전하게 처리하며,
          「개인정보 보호법」 제30조에 따라 다음과 같이 개인정보 처리방침을 공개합니다.
        </p>

        <nav aria-label="목차" className="mt-9 rounded-xl bg-[#f4f6f9] p-5">
          <h2 className="font-semibold">목차</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[#4e5968]">
            {sections.map((section, index) => (
              <li key={section}><a href={`#section-${index + 1}`} className="hover:text-[var(--accent)] hover:underline">{section}</a></li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 space-y-10 leading-7 text-[#4e5968] [&_h2]:mb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[var(--foreground)] [&_li]:mb-1">
          <section id="section-1" className="scroll-mt-8">
            <h2>1. 개인정보의 처리 목적</h2>
            <ul className="list-disc pl-5">
              <li>회원 가입 및 관리: 회원 식별, 로그인, 계정 유지, 부정 이용 방지</li>
              <li>서비스 제공: 링크와 폴더의 저장·조회·관리</li>
              <li>고충 처리: 문의 확인, 답변 및 필요한 연락</li>
            </ul>
            <p className="mt-3">처리 목적이 변경되면 관계 법령에 따른 조치를 거칩니다.</p>
          </section>

          <section id="section-2" className="scroll-mt-8">
            <h2>2. 처리하는 개인정보의 항목</h2>
            <ul className="list-disc pl-5">
              <li>이메일 회원가입: 이메일 주소, 비밀번호(원문이 아닌 암호화된 인증 정보)</li>
              <li>카카오 로그인: 카카오 계정 식별 정보와 제공에 동의한 계정 정보</li>
              <li>서비스 이용: 이용자가 저장한 링크 URL·제목·설명, 폴더 이름</li>
              <li>서비스 접속: 인증 쿠키, IP 주소 및 접속 기록 등 운영에 필요한 정보</li>
            </ul>
            <p className="mt-3">회원 계정과 서비스 데이터는 계약의 이행 및 서비스 제공을 위해 처리합니다.</p>
          </section>

          <section id="section-3" className="scroll-mt-8">
            <h2>3. 개인정보의 처리 및 보유 기간</h2>
            <p>회원 정보와 이용자가 저장한 링크·폴더는 회원 탈퇴 또는 삭제 요청 시까지 보유합니다. 접속 및 인증 기록은 서비스 운영에 필요한 기간 동안 보유하며, 법령에 보존 의무가 있는 경우 해당 기간까지 보관합니다.</p>
          </section>

          <section id="section-4" className="scroll-mt-8">
            <h2>4. 개인정보의 파기 절차 및 방법</h2>
            <p>보유 기간이 끝나거나 처리 목적이 달성되어 개인정보가 불필요해지면 지체 없이 파기합니다. 전자적 정보는 복구할 수 없도록 삭제하고, 법령에 따라 보존해야 하는 정보는 별도로 분리해 보관한 뒤 기간이 끝나면 파기합니다.</p>
          </section>

          <section id="section-5" className="scroll-mt-8">
            <h2>5. 개인정보 처리업무의 위탁</h2>
            <p>서비스 운영을 위해 다음 업무를 위탁합니다.</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-left text-sm [&_td]:border [&_td]:border-[#e5e8eb] [&_td]:p-3 [&_th]:border [&_th]:border-[#e5e8eb] [&_th]:bg-[#f4f6f9] [&_th]:p-3">
                <thead><tr><th>수탁업체</th><th>위탁 업무</th><th>처리 지역</th></tr></thead>
                <tbody>
                  <tr><td>Supabase Inc.</td><td>회원 인증 및 데이터베이스 운영</td><td>대한민국 (Seoul)</td></tr>
                  <tr><td>Vercel Inc.</td><td>웹 서비스 호스팅 및 배포</td><td>대한민국 (Seoul Edge)</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">위탁 업무와 업체가 변경되면 이 처리방침에 공개합니다.</p>
          </section>

          <section id="section-6" className="scroll-mt-8">
            <h2>6. 정보주체의 권리와 행사 방법</h2>
            <p>이용자는 본인의 개인정보 열람, 정정·삭제, 처리정지 및 동의 철회를 요청할 수 있습니다. 요청은 <a href={`mailto:${contactEmail}`} className="text-[var(--accent)] underline">{contactEmail}</a>로 보내주시면 확인 후 관계 법령에 따라 처리합니다. 다른 사람의 개인정보를 침해하지 않도록 본인 확인을 요청할 수 있습니다.</p>
          </section>

          <section id="section-7" className="scroll-mt-8">
            <h2>7. 개인정보의 안전성 확보 조치</h2>
            <p>HTTPS 통신, 접근 권한 관리, 비밀번호 보호, 데이터베이스의 행 단위 접근 제어(RLS) 등 기술적·관리적 조치를 적용합니다.</p>
          </section>

          <section id="section-8" className="scroll-mt-8">
            <h2>8. 쿠키의 사용 및 거부 방법</h2>
            <p>로그인 상태 유지와 인증을 위해 쿠키를 사용합니다. 브라우저 설정에서 쿠키 저장을 거부하거나 삭제할 수 있지만, 이 경우 로그인이 필요한 기능을 이용하기 어려울 수 있습니다.</p>
          </section>

          <section id="section-9" className="scroll-mt-8">
            <h2>9. 개인정보 보호책임자</h2>
            <p>개인정보 처리 및 관련 고충을 담당하는 운영자는 {operatorName}입니다.</p>
            <p>연락처: <a href={`mailto:${contactEmail}`} className="text-[var(--accent)] underline">{contactEmail}</a></p>
          </section>

          <section id="section-10" className="scroll-mt-8">
            <h2>10. 권익침해 구제방법</h2>
            <p>개인정보 침해에 관한 상담이나 구제는 <a href="https://www.kopico.go.kr" className="text-[var(--accent)] underline">개인정보분쟁조정위원회</a> 또는 <a href="https://privacy.kisa.or.kr" className="text-[var(--accent)] underline">개인정보침해신고센터</a>에 요청할 수 있습니다.</p>
          </section>

          <section id="section-11" className="scroll-mt-8">
            <h2>11. 처리방침의 변경</h2>
            <p>이 처리방침은 <time dateTime={effectiveDate}>{effectiveDate}</time>부터 적용합니다. 내용이 변경되면 시행 전에 이 페이지를 통해 안내합니다.</p>
          </section>
        </div>
      </article>
    </main>
  );
}
