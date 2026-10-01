import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="landing-hero">
        <span className="kicker">RBE Developer Portal</span>
        <h1>Build packages. Publish cleanly. Ship through RBE.</h1>
        <p>Discover public RBE packages, learn the RPX workflow, publish from a public Git repository, and manage releases from one focused developer portal.</p>
        <div className="button-row landing-actions">
          <Link className="button primary" href="/explore">Explore packages</Link>
          <Link className="button" href="/dash">Open dashboard</Link>
        </div>
        <form className="public-search landing-search" action="/explore">
          <span className="search-icon">⌕</span>
          <input name="q" placeholder="Search packages" aria-label="Search RBE packages" />
          <button className="button primary" type="submit">Search</button>
        </form>
      </section>

      <section className="landing-grid">
        <article className="landing-card neon-violet">
          <span className="eyebrow">01 · Create</span>
          <h2>Start with a public Git repository.</h2>
          <p>Keep the package source in GitHub, HappyFace, or another supported Git provider. The registry builds from source instead of trusting random uploaded ZIP files.</p>
          <code>https://github.com/you/your-rbe-package</code>
        </article>
        <article className="landing-card neon-cyan">
          <span className="eyebrow">02 · Check</span>
          <h2>Run the same checks before publishing.</h2>
          <p>RPX validates package structure, components, compilers, security state, package integrity, and the dependency graph before a release reaches the index.</p>
          <code>rpx check -all</code>
        </article>
        <article className="landing-card neon-green">
          <span className="eyebrow">03 · Publish</span>
          <h2>Publish from CLI or the web.</h2>
          <p>Use the browser-based developer login with RPX, or connect the same public repository in the dashboard and watch validation happen live.</p>
          <code>rpx login  →  rpx publish</code>
        </article>
      </section>

      <section className="landing-section split-section">
        <div>
          <span className="kicker">Package workflow</span>
          <h2>Built around the package index, not around dashboard clutter.</h2>
          <p>The public side is for discovery and downloads. The dashboard is for package owners: deployments, releases, automation, analytics, build settings, and security.</p>
        </div>
        <div className="terminal-card">
          <div className="terminal-title"><span>RPX</span><small>project setup</small></div>
          <pre>{`package.rbe.json
{
  "dependencies": {
    "mail": "0.4.3"
  }
}

$ rpx install
✓ resolved package graph
✓ verified package artifacts
✓ lock state written`}</pre>
        </div>
      </section>

      <section className="landing-section">
        <div className="section-heading-row">
          <div><span className="kicker">Two ways in</span><h2>Use RPX, or download the package artifact yourself.</h2></div>
          <Link className="text-link" href="/explore">Browse the index →</Link>
        </div>
        <div className="install-choice-grid">
          <div className="install-choice"><strong>RPX managed install</strong><p>Add the dependency to <code>package.rbe.json</code>, then let RPX resolve the exact graph, verify artifacts, and write the lock.</p><code>rpx install</code></div>
          <div className="install-choice"><strong>Direct artifact</strong><p>Every public package page exposes the canonical <code>.rbe.zip</code> artifact for developers who want the package file directly.</p><Link href="/explore">Find a package →</Link></div>
        </div>
      </section>
    </>
  );
}
