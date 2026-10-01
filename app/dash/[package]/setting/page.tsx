import { notFound } from "next/navigation";
import { findPackage } from "@/lib/mock-data";

export default async function PackageSettingsPage({ params }: { params: Promise<{ package: string }> }) {
  const { package: packageName } = await params;
  const pkg = findPackage(packageName);
  if (!pkg) return notFound();

  return (
    <>
      <section className="dash-page-heading"><span className="kicker">{pkg.name}</span><h1>Settings</h1><p>Control source, build defaults, package metadata, and automatic release behavior.</p></section>
      <form className="settings-stack">
        <section className="panel settings-card">
          <div className="settings-card-head"><div><span className="eyebrow">Source</span><h2>Repository settings</h2></div><span className="settings-default">Connected</span></div>
          <label>Repository URL<input defaultValue={pkg.repository} /></label>
          <div className="settings-grid two"><label>Git provider<select defaultValue="github"><option value="github">GitHub</option><option value="happyface">HappyFace</option><option value="git">Other Git provider</option></select></label><label>Production branch<input defaultValue="main" /></label></div>
        </section>

        <section className="panel settings-card">
          <div className="settings-card-head"><div><span className="eyebrow">Build</span><h2>Build settings</h2><p>RPX defaults work for normal packages. Root and commands can be overridden when the repository is a monorepo or needs custom preparation.</p></div><button className="button" type="button">Restore defaults</button></div>
          <div className="settings-grid two"><label>Root directory<input defaultValue="/" /></label><label>Build mode<select defaultValue="auto"><option value="auto">Auto-detect</option><option value="rust">Rust</option><option value="bun">Bun / TypeScript</option><option value="node">Node.js</option><option value="python">Python</option></select></label><label>Validation command<input defaultValue="rpx check -all" /></label><label>Build command<input placeholder="Use RPX default" /></label></div>
          <label className="toggle-setting"><span><strong>Ignore warnings</strong><small>Warnings are hidden during automated checks. Errors and security issues still stop publication.</small></span><input type="checkbox" /></label>
        </section>

        <section className="panel settings-card">
          <div className="settings-card-head"><div><span className="eyebrow">Automation</span><h2>Git-triggered releases</h2><p>Provider events can validate or publish the package automatically.</p></div></div>
          <label className="toggle-setting"><span><strong>Automatically publish Git releases</strong><small>When a release/tag is created on the connected Git provider, run validation and publish the matching package version.</small></span><input type="checkbox" /></label>
          <label className="toggle-setting"><span><strong>Validate pushes to main</strong><small>Run a deployment check for pushes without publishing a new package version.</small></span><input type="checkbox" defaultChecked /></label>
          <label className="toggle-setting"><span><strong>Publish pre-releases</strong><small>Allow provider releases marked beta/preview to enter the package index as non-stable versions.</small></span><input type="checkbox" /></label>
        </section>

        <section className="panel settings-card">
          <div className="settings-card-head"><div><span className="eyebrow">Package</span><h2>Package metadata</h2></div></div>
          <label>Display name<input defaultValue={pkg.name} /></label><label>Description<textarea defaultValue={pkg.description} rows={4} /></label>
        </section>

        <div className="settings-submit-row"><span>Changes apply to future deployments.</span><button className="button primary" type="submit">Save settings</button></div>
      </form>
    </>
  );
}
