"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

const mainItems = [
  ["Overview", "/dash", "⌂"],
  ["Packages", "/dash/packages", "◇"],
  ["Deployments", "/dash/deployments", "↯"],
  ["Upload New Package", "/dash/new-package", "+"],
];

const reserved = new Set(["packages", "deployments", "new-package"]);

export function DashShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const maybePackage = segments[1];
  const packageName = maybePackage && !reserved.has(maybePackage) ? maybePackage : null;

  return (
    <div className="dash-shell">
      <aside className="dash-sidebar">
        <div className="dash-sidebar-top">
          <Link className="brand dash-brand" href="/"><span className="brand-mark">R</span><span>RBE Developer</span></Link>
          <Link className="back-to-public" href="/explore">← Package explorer</Link>
        </div>

        <nav className="dash-nav">
          <span className="dash-nav-label">Workspace</span>
          {mainItems.map(([label, href, icon]) => {
            const active = href === "/dash" ? pathname === "/dash" : pathname.startsWith(href);
            return <Link className={active ? "dash-nav-item active" : "dash-nav-item"} href={href} key={href}><span>{icon}</span>{label}</Link>;
          })}
        </nav>

        {packageName && (
          <nav className="dash-nav package-nav">
            <span className="dash-nav-label">{packageName}</span>
            <Link className={pathname === `/dash/${packageName}` ? "dash-nav-item active" : "dash-nav-item"} href={`/dash/${packageName}`}><span>◫</span>Overview</Link>
            <Link className={pathname.startsWith(`/dash/${packageName}/deployments`) ? "dash-nav-item active" : "dash-nav-item"} href={`/dash/${packageName}/deployments`}><span>↯</span>Deployments</Link>
            <Link className={pathname.startsWith(`/dash/${packageName}/releases`) ? "dash-nav-item active" : "dash-nav-item"} href={`/dash/${packageName}/releases`}><span>◈</span>Releases</Link>
            <Link className={pathname.startsWith(`/dash/${packageName}/setting`) ? "dash-nav-item active" : "dash-nav-item"} href={`/dash/${packageName}/setting`}><span>⚙</span>Settings</Link>
          </nav>
        )}

        <div className="dash-sidebar-bottom">
          <ThemeToggle />
          <Link href="/sessions">CLI sessions</Link>
          <Link href="/security">Security</Link>
        </div>
      </aside>

      <div className="dash-main">
        <header className="dash-topbar">
          <div><span className="dash-mobile-title">Developer Console</span>{packageName && <span className="dash-package-context">/ {packageName}</span>}</div>
          <button className="account-pill">Kate <span>⌄</span></button>
        </header>
        <main className="dash-content">{children}</main>
      </div>
    </div>
  );
}
