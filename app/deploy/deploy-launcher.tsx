"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type CreatedDeployment = {
  deploymentId: string;
  accountPublicId: string;
};

type CreateResponse = {
  ok?: boolean;
  deployment?: CreatedDeployment;
  error?: string;
  message?: string;
};

function providerFor(repository: string): "github" | "git" {
  try {
    return new URL(repository).hostname.toLowerCase() === "github.com" ? "github" : "git";
  } catch {
    return "git";
  }
}

export function DeployLauncher() {
  const router = useRouter();
  const [repo, setRepo] = useState("https://github.com/Kate-alt-69/rbe-mail");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function deploy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const repository = repo.trim();
    if (!repository) return;

    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/developer/deployments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          repository,
          provider: providerFor(repository),
          gitRef: "main",
          trigger: "manual",
          build: {
            root: "/",
            buildMode: "auto",
            checkCommand: "rpx check -all",
            buildCommand: "auto",
            ignoreWarnings: false,
          },
        }),
      });
      const body = await response.json() as CreateResponse;
      if (!response.ok || body.ok !== true || !body.deployment?.deploymentId || !body.deployment.accountPublicId) {
        setError(body.message || body.error || "Could not create the deployment.");
        return;
      }
      router.push(`/deploy?account=${encodeURIComponent(body.deployment.accountPublicId)}&deployid=${encodeURIComponent(body.deployment.deploymentId)}`);
      router.refresh();
    } catch (deployError) {
      setError(deployError instanceof Error ? deployError.message : "Could not reach the deployment API.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="deploy-start-shell">
    <section className="page-heading">
      <span className="kicker">New deployment</span>
      <h1>Publish from a public repository.</h1>
      <p>RBE records the deployment durably, validates the source through the managed build path, and publishes only after the package passes the required checks.</p>
    </section>

    <form className="panel deploy-start-card" onSubmit={deploy}>
      <div className="deploy-input-label"><label htmlFor="repo">Repository URL</label><span>Public HTTPS repositories only</span></div>
      <div className="deploy-input-row">
        <input id="repo" type="url" required value={repo} onChange={(event) => setRepo(event.target.value)} spellCheck={false} disabled={busy} />
        <button className="button primary" type="submit" disabled={busy}>{busy ? "Creating…" : "Deploy"}</button>
      </div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <div className="repo-policy">
        <span className="policy-icon">↗</span>
        <div><strong>Source-first publishing</strong><p>No direct ZIP upload. The registry builds the `.rbe.zip` from the public source it actually validated.</p></div>
      </div>
    </form>

    <section className="deploy-help-grid">
      <div><span className="eyebrow">CLI</span><strong>Prefer the terminal?</strong><code>rpx publish</code></div>
      <div><span className="eyebrow">Dashboard</span><strong>Open deployment history</strong><code>/dash/deployments</code></div>
    </section>
  </div>;
}
