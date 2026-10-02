This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Supabase 비밀번호 재설정 설정

Supabase Dashboard의 **Authentication → URL Configuration → Redirect URLs**에 개발 주소 `http://localhost:3000/auth/recovery`와 배포 주소 `https://<서비스 도메인>/auth/recovery`를 등록하세요. 비밀번호 찾기 화면은 현재 접속한 주소의 `/auth/recovery`를 이메일 링크의 돌아올 주소로 사용합니다. 비밀번호 재설정 이메일 템플릿을 직접 수정했다면 링크가 Supabase의 `{{ .ConfirmationURL }}`을 사용하거나 지정한 Redirect URL로 돌아오는지 확인하세요.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
