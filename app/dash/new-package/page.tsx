export default function NewPackagePage() {
  return (
    <>
      <section className="dash-page-heading"><span className="kicker">New package</span><h1>Upload New Package</h1><p>Connect a public Git repository. RBE will fetch source, validate the package, build it with the selected settings, and publish the canonical artifact.</p></section>

      <form className="settings-stack">
        <section className="panel settings-card">
          <div className="settings-card-head"><div><span className="eyebrow">Source</span><h2>Repository</h2></div><span className="settings-default">Required</span></div>
          <label>Public repository URL<input name="repository" placeholder="https://github.com/you/package" /></label>
          <div className="settings-grid two">
            <label>Git provider<select defaultValue="github"><option value="github">GitHub</option><option value="happyface">HappyFace</option><option value="git">Other Git provider</option></select></label>
            <label>Default branch<input name="branch" defaultValue="main" /></label>
          </div>
        </section>

        <section className="panel settings-card">
          <div className="settings-card-head"><div><span className="eyebrow">Build</span><h2>Build settings</h2><p>Defaults are intentionally automatic. Override them only when your package layout needs it.</p></div><span className="settings-default">Defaults enabled</span></div>
          <div className="settings-grid two">
            <label>Root directory<input name="root" defaultValue="/" /></label>
            <label>Build mode<select defaultValue="auto"><option value="auto">Auto-detect</option><option value="rust">Rust</option><option value="bun">Bun / TypeScript</option><option value="node">Node.js</option><option value="python">Python</option></select></label>
            <label>Check command<input name="check" defaultValue="rpx check -all" /></label>
            <label>Build command<input name="build" placeholder="Auto-detected by RPX" /></label>
          </div>
          <label className="toggle-setting"><span><strong>Ignore warnings during publish checks</strong><small>Equivalent to <code>-ignore-warning</code>. Errors and security blocks still stop the release.</small></span><input type="checkbox" /></label>
        </section>

        <section className="panel settings-card">
          <div className="settings-card-head"><div><span className="eyebrow">Automation</span><h2>Release triggers</h2><p>You can enable these after the first package is created.</p></div></div>
          <label className="toggle-setting"><span><strong>Publish when a Git release is created</strong><small>Build and publish the tagged version when the connected provider creates a release.</small></span><input type="checkbox" /></label>
          <label className="toggle-setting"><span><strong>Build pushes to the default branch</strong><small>Validate pushes automatically without publishing a package release.</small></span><input type="checkbox" defaultChecked /></label>
        </section>

        <div className="settings-submit-row"><span>Nothing is uploaded until the repository passes package validation.</span><button className="button primary" type="submit">Connect repository →</button></div>
      </form>
    </>
  );
}
