import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-8 text-center text-xs text-muted-foreground">
      <p>
        <span>이용약관</span>
        <span className="mx-1.5">·</span>
        <Link href="/privacy" className="hover:text-foreground">
          개인정보처리방침
        </Link>
        <span className="mx-1.5">·</span>
        <span>문의</span>
        <span className="mx-1.5">·</span>
        <span>sisiduck © {new Date().getFullYear()}</span>
      </p>
    </footer>
  );
}
