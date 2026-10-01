"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { MOCK_ACCOUNT_PUBLIC_ID } from "@/lib/config";

function slugFromRepo(repo: string) {
  const raw = repo.split("/").filter(Boolean).pop()?.replace(/\.git$/i, "") || "package";
  return raw.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "package";
}

export function DeployLauncher() {
  const router = useRouter();
  const [repo, setRepo] = useState("https://github.com/Kate-alt-69/rbe-mail");
  const slug = useMemo(() => slugFromRepo(repo), [repo]);

  function deploy() {
    const id = `dpl_preview_${slug}`;
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`rbe.deploy.repo.${id}`, repo);
    }
    router.push(`/deploy?account=${encodeURIComponent(MOCK_ACCOUNT_PUBLIC_ID)}&deployid=${encodeURIComponent(id)}`);
  }

  return <div className="deploy-start-shell">
    <section className="page-heading">
      <span className="kicker">New deployment</span>
      <h1>Publish from a public repository.</h1>
      <p>RBE fetches the repository itself, validates the package, compiles it, checks Security/RPER state, builds the canonical artifact and writes the registry revision.</p>
    </section>

    <section className="panel deploy-start-card">
      <div className="deploy-input-label"><label htmlFor="repo">Repository URL</label><span>Public repositories only</span></div>
      <div className="deploy-input-row">
        <input id="repo" value={repo} onChange={(event) => setRepo(event.target.value)} spellCheck={false} />
        <button className="button primary" onClick={deploy}>Deploy</button>
      </div>
      <div className="repo-policy">
        <span className="policy-icon">↗</span>
        <div><strong>Source-first publishing</strong><p>No direct ZIP upload. The registry builds the `.rbe.zip` from the public source it actually validated.</p></div>
      </div>
    </section>

    <section className="deploy-help-grid">
      <div><span className="eyebrow">CLI</span><strong>Prefer the terminal?</strong><code>rpx publish</code></div>
      <div><span className="eyebrow">Latest</span><strong>Open your newest deploy</strong><code>/deploy?account={MOCK_ACCOUNT_PUBLIC_ID}&deployid=latest</code></div>
    </section>
  </div>;
}
