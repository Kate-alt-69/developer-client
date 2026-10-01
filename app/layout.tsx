import type { Metadata } from "next";
import "./globals.css";
import "./v2.css";
import "./theme.css";
import "./portal.css";
import { Shell } from "@/components/shell";

export const metadata: Metadata = {
  title: "RBE Developer",
  description: "Discover, publish, inspect and manage RBE packages.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const themeBoot = `
    try {
      const stored = localStorage.getItem('rbe-developer-theme');
      const preferred = stored || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.dataset.theme = preferred;
    } catch {}
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeBoot }} /></head>
      <body><Shell>{children}</Shell></body>
    </html>
  );
}
