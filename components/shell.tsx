"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["Overview", "/"],
  ["Packages", "/packages"],
  ["Deploy", "/deploy/new"],
  ["Security", "/security"],
  ["CLI Sessions", "/sessions"],
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/auth")) {
    return <div className="auth-shell">{children}</div>;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/">
          <span className="brand-mark">R</span>
          <span>RBE Developer</span>
        </Link>
        <nav className="nav">
          {items.map(([label, href]) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return <Link key={href} className={active ? "nav-link active" : "nav-link"} href={href}>{label}</Link>;
          })}
        </nav>
        <button className="account-pill">Kate <span>⌄</span></button>
      </header>
      <main className="page">{children}</main>
      <footer className="footer">
        <span>Kastrick ® 2026</span>
        <span>Made with Love, Made with Nextjs Engine.</span>
      </footer>
    </div>
  );
}
