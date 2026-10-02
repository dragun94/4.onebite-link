/** Shared by the form and API so bare domains behave identically in both. */
export function normalizeLinkUrl(input: string): string {
  const value = input.trim();
  if (!value || value.length > 4096 || /[\s\\\u0000-\u001f\u007f]/.test(value)) {
    throw new Error("올바른 링크 주소를 입력해 주세요.");
  }

  let candidate = value;
  if (value.startsWith("//")) candidate = `https:${value}`;
  else if (!/^https?:\/\//i.test(value)) {
    if (/^[a-z][a-z\d+.-]*:/i.test(value) && !/^[^/?#]+:\d+(?:[/?#]|$)/.test(value)) {
      throw new Error("http 또는 https 웹페이지 주소만 사용할 수 있어요.");
    }
    candidate = `https://${value}`;
  }

  let url: URL;
  try { url = new URL(candidate); } catch {
    throw new Error("올바른 링크 주소를 입력해 주세요.");
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || !url.hostname) {
    throw new Error("로그인 정보가 포함되지 않은 웹페이지 주소를 입력해 주세요.");
  }
  return url.href;
}

export type LinkMetadata = {
  title: string;
  description: string;
  thumbnail: string | null;
  url: string;
};
