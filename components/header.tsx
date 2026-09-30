import Link from "next/link";
import Icon from "./icon";

export default function Header({ onAdd }: { onAdd: () => void }) {
  return (
    <header className="site-header">
      <Link href="/" className="logo"><span className="logo-mark"><Icon name="link" size={21} /></span>한입 링크<span className="logo-dot">.</span></Link>
      <div className="header-actions">
        <span className="header-caption">좋은 링크를 모으는 나만의 공간</span>
        <button className="primary-button" onClick={onAdd}><Icon name="plus" size={18} />새 링크</button>
      </div>
    </header>
  );
}
