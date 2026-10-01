"use client";

import { FormEvent, useEffect, useState } from "react";

type SourceSettings = {
  repository: string | null;
  provider: "github" | "happyface" | "git";
  productionBranch: string;
};

type BuildSettings = {
  root: string;
  buildMode: "auto" | "rust" | "bunjs" | "nodejs" | "python";
  checkCommand: string;
  buildCommand: string;
  ignoreWarnings: boolean;
};

type AutomationSettings = {
  publishGitReleases: boolean;
  validateProductionPushes: boolean;
  publishPrereleases: boolean;
};

type MetadataSettings = {
  displayName: string;
  description: string | null;
};

type Settings = {
  source: SourceSettings;
  build: BuildSettings;
  automation: AutomationSettings;
  metadata: MetadataSettings;
  updatedAt?: number | null;
};

type SettingsResponse = {
  ok?: boolean;
  package?: string;
  persisted?: boolean;
  settings?: Settings;
  error?: string;
  message?: string;
};

function defaults(packageName: string): Settings {
  return {
    source: { repository: null, provider: "github", productionBranch: "main" },
    build: {
      root: "/",
      buildMode: "auto",
      checkCommand: "rpx check -all",
      buildCommand: "auto",
      ignoreWarnings: false,
    },
    automation: {
      publishGitReleases: false,
      validateProductionPushes: true,
      publishPrereleases: false,
    },
    metadata: { displayName: packageName, description: null },
    updatedAt: null,
  };
}

function messageFor(body: SettingsResponse): string {
  if (body.error === "package_not_owned") return "This UAC account does not own this RPX package.";
  if (body.error === "invalid_session" || body.error === "unauthorized") return "Your developer session expired. Sign in again.";
  if (body.error === "invalid_package_settings") return body.message || "One or more package settings are invalid.";
  return body.message || "Could not update package settings.";
}

export function PackageSettingsClient({ packageName }: { packageName: string }) {
  const [settings, setSettings] = useState<Settings>(() => defaults(packageName));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [persisted, setPersisted] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(`/api/developer/settings?package=${encodeURIComponent(packageName)}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const body = await response.json() as SettingsResponse;
        if (!response.ok || body.ok !== true || !body.settings) {
          setError(messageFor(body));
          return;
        }
        setSettings(body.settings);
        setPersisted(body.persisted === true);
      } catch (fetchError) {
        if (!controller.signal.aborted) {
          setError(fetchError instanceof Error ? fetchError.message : "Could not load package settings.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [packageName]);

  function patchSource(patch: Partial<SourceSettings>) {
    setSettings((current) => ({ ...current, source: { ...current.source, ...patch } }));
  }
  function patchBuild(patch: Partial<BuildSettings>) {
    setSettings((current) => ({ ...current, build: { ...current.build, ...patch } }));
  }
  function patchAutomation(patch: Partial<AutomationSettings>) {
    setSettings((current) => ({ ...current, automation: { ...current.automation, ...patch } }));
  }
  function patchMetadata(patch: Partial<MetadataSettings>) {
    setSettings((current) => ({ ...current, metadata: { ...current.metadata, ...patch } }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/developer/settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          package: packageName,
          settings: {
            source: settings.source,
            build: settings.build,
            automation: settings.automation,
            metadata: settings.metadata,
          },
        }),
      });
      const body = await response.json() as SettingsResponse;
      if (!response.ok || body.ok !== true || !body.settings) {
        setError(messageFor(body));
        return;
      }
      setSettings(body.settings);
      setPersisted(true);
      setNotice("Settings saved. Future deployments will use this policy.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save package settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <section className="panel settings-card"><div className="empty-state"><strong>Loading package settings…</strong><span>Resolving RPX ownership and stored policy.</span></div></section>;
  }

  return (
    <form className="settings-stack" onSubmit={save}>
      <section className="panel settings-card">
        <div className="settings-card-head"><div><span className="eyebrow">Source</span><h2>Repository settings</h2></div><span className="settings-default">{persisted ? "Saved" : "Defaults"}</span></div>
        <label>Repository URL<input type="url" placeholder="https://github.com/you/package" value={settings.source.repository || ""} onChange={(event) => patchSource({ repository: event.target.value || null })} disabled={saving} /></label>
        <div className="settings-grid two">
          <label>Git provider<select value={settings.source.provider} onChange={(event) => patchSource({ provider: event.target.value as SourceSettings["provider"] })} disabled={saving}><option value="github">GitHub</option><option value="happyface">HappyFace</option><option value="git">Other Git provider</option></select></label>
          <label>Production branch<input value={settings.source.productionBranch} onChange={(event) => patchSource({ productionBranch: event.target.value })} disabled={saving} /></label>
        </div>
      </section>

      <section className="panel settings-card">
        <div className="settings-card-head"><div><span className="eyebrow">Build</span><h2>Build settings</h2><p>RPX defaults remain automatic unless this repository needs an override.</p></div><button className="button" type="button" onClick={() => setSettings((current) => ({ ...defaults(packageName), metadata: current.metadata }))} disabled={saving}>Restore defaults</button></div>
        <div className="settings-grid two">
          <label>Root directory<input value={settings.build.root} onChange={(event) => patchBuild({ root: event.target.value })} disabled={saving} /></label>
          <label>Build mode<select value={settings.build.buildMode} onChange={(event) => patchBuild({ buildMode: event.target.value as BuildSettings["buildMode"] })} disabled={saving}><option value="auto">Auto-detect</option><option value="rust">Rust</option><option value="bunjs">Bun / TypeScript</option><option value="nodejs">Node.js</option><option value="python">Python</option></select></label>
          <label>Validation command<input value={settings.build.checkCommand} onChange={(event) => patchBuild({ checkCommand: event.target.value })} disabled={saving} /></label>
          <label>Build command<input value={settings.build.buildCommand} onChange={(event) => patchBuild({ buildCommand: event.target.value })} disabled={saving} /></label>
        </div>
        <label className="toggle-setting"><span><strong>Ignore normal warnings</strong><small>Errors and security blocks still stop publication.</small></span><input type="checkbox" checked={settings.build.ignoreWarnings} onChange={(event) => patchBuild({ ignoreWarnings: event.target.checked })} disabled={saving} /></label>
      </section>

      <section className="panel settings-card">
        <div className="settings-card-head"><div><span className="eyebrow">Automation</span><h2>Git-triggered releases</h2><p>Stored now; provider webhook execution can consume these policies when connected.</p></div></div>
        <label className="toggle-setting"><span><strong>Automatically publish Git releases</strong><small>GitHub Release, HappyFace equivalent, or another connected provider can trigger validation and publication.</small></span><input type="checkbox" checked={settings.automation.publishGitReleases} onChange={(event) => patchAutomation({ publishGitReleases: event.target.checked })} disabled={saving} /></label>
        <label className="toggle-setting"><span><strong>Validate production-branch pushes</strong><small>Create validation deployments for pushes without publishing a new version.</small></span><input type="checkbox" checked={settings.automation.validateProductionPushes} onChange={(event) => patchAutomation({ validateProductionPushes: event.target.checked })} disabled={saving} /></label>
        <label className="toggle-setting"><span><strong>Publish pre-releases</strong><small>Allow beta/preview provider releases into RPX as non-stable versions.</small></span><input type="checkbox" checked={settings.automation.publishPrereleases} onChange={(event) => patchAutomation({ publishPrereleases: event.target.checked })} disabled={saving} /></label>
      </section>

      <section className="panel settings-card">
        <div className="settings-card-head"><div><span className="eyebrow">Package</span><h2>Package metadata</h2><p>Developer metadata for future deployments and releases.</p></div></div>
        <label>Display name<input value={settings.metadata.displayName} onChange={(event) => patchMetadata({ displayName: event.target.value })} maxLength={128} disabled={saving} /></label>
        <label>Description<textarea value={settings.metadata.description || ""} onChange={(event) => patchMetadata({ description: event.target.value || null })} rows={4} maxLength={4096} disabled={saving} /></label>
      </section>

      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {notice ? <p className="form-success" role="status">{notice}</p> : null}
      <div className="settings-submit-row"><span>{settings.updatedAt ? `Last saved ${new Date(settings.updatedAt * 1000).toLocaleString()}` : "No custom settings saved yet."}</span><button className="button primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save settings"}</button></div>
    </form>
  );
}
