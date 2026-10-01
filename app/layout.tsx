import type { Metadata } from "next";
import "./globals.css";
import "./v2.css";
import "./theme.css";
import { Shell } from "@/components/shell";

export const metadata: Metadata = {
  title: "RBE Developer",
  description: "Publish, inspect and manage RBE packages.",
};

const themeScript = `
(() => {
  try {
    const saved = localStorage.getItem('rbe-developer-theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme = saved || (systemDark ? 'dark' : 'light');
  } catch (_) {
    document.documentElement.dataset.theme = 'light';
  }
})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
