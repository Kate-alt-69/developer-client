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

export function NewPackageForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");

    const data = new FormData(event.currentTarget);
    const repository = String(data.get("repository") || "").trim();
    const packageName = String(data.get("package") || "").trim();
    const branch = String(data.get("branch") || "main").trim() || "main";
    const buildCommand = String(data.get("build") || "").trim() || "auto";

    try {
      const response = await fetch("/api/developer/deployments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          repository,
          provider: String(data.get("provider") || "github"),
          ...(packageName ? { package: packageName } : {}),
          gitRef: branch,
          trigger: "manual",
          build: {
            root: String(data.get("root") || "/").trim() || "/",
            buildMode: String(data.get("buildMode") || "auto"),
            checkCommand: String(data.get("check") || "rpx check -all").trim() || "rpx check -all",
            buildCommand,
            ignoreWarnings: data.get("ignoreWarnings") === "on",
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
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not reach the deployment API.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="settings-stack" onSubmit={submit}>
      <section className="panel settings-card">
        <div className="settings-card-head"><div><span className="eyebrow">Source</span><h2>Repository</h2></div><span className="settings-default">Required</span></div>
        <label>Public repository URL<input name="repository" type="url" placeholder="https://github.com/you/package" required disabled={busy} /></label>
        <div className="settings-grid two">
          <label>Package name <small>Optional until RBE inspects the manifest.</small><input name="package" placeholder="my-package" disabled={busy} /></label>
          <label>Git provider<select name="provider" defaultValue="github" disabled={busy}><option value="github">GitHub</option><option value="happyface">HappyFace</option><option value="git">Other Git provider</option></select></label>
          <label>Git ref / branch<input name="branch" defaultValue="main" disabled={busy} /></label>
        </div>
      </section>

      <section className="panel settings-card">
        <div className="settings-card-head"><div><span className="eyebrow">Build</span><h2>Build settings</h2><p>RBE defaults stay automatic unless this repository needs an override.</p></div><span className="settings-default">Defaults enabled</span></div>
        <div className="settings-grid two">
          <label>Root directory<input name="root" defaultValue="/" disabled={busy} /></label>
          <label>Build mode<select name="buildMode" defaultValue="auto" disabled={busy}><option value="auto">Auto-detect</option><option value="rust">Rust</option><option value="bunjs">Bun / TypeScript</option><option value="nodejs">Node.js</option><option value="python">Python</option></select></label>
          <label>Check command<input name="check" defaultValue="rpx check -all" disabled={busy} /></label>
          <label>Build command<input name="build" placeholder="Auto-detected by RBE" disabled={busy} /></label>
        </div>
        <label className="toggle-setting"><span><strong>Ignore normal warnings during publish checks</strong><small>Errors and security blocks still stop the release.</small></span><input name="ignoreWarnings" type="checkbox" disabled={busy} /></label>
      </section>

      <section className="panel settings-card">
        <div className="settings-card-head"><div><span className="eyebrow">Automation</span><h2>Release triggers</h2><p>Automation is configured after the package identity is established.</p></div><span className="settings-default">After first deploy</span></div>
        <label className="toggle-setting"><span><strong>Publish when a Git release is created</strong><small>Configure GitHub, HappyFace or another provider from the package settings page.</small></span><input type="checkbox" disabled /></label>
        <label className="toggle-setting"><span><strong>Build pushes to the production branch</strong><small>Configure this after RBE has resolved the package and source root.</small></span><input type="checkbox" disabled /></label>
      </section>

      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <div className="settings-submit-row"><span>The repository is recorded only after the request passes backend validation.</span><button className="button primary" type="submit" disabled={busy}>{busy ? "Creating deployment…" : "Connect repository →"}</button></div>
    </form>
  );
}
