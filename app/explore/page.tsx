import Link from "next/link";
import { getRegistryPackages } from "@/lib/registry";

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();
  const { packages, live } = await getRegistryPackages();
  const filtered = packages
    .filter((pkg) => !query || pkg.name.toLowerCase().includes(query) || pkg.description.toLowerCase().includes(query))
    .sort((a, b) => b.downloads - a.downloads);

  return (
    <>
      <section className="explore-hero">
        <span className="kicker">RBE Package Index</span>
        <h1>Explore packages.</h1>
        <p>Search public packages, inspect versions and security state, use them through RPX, or download the canonical <code>.rbe.zip</code> artifact directly.</p>
        <form className="public-search explore-search" action="/explore">
          <span className="search-icon">⌕</span>
          <input name="q" defaultValue={q} placeholder="Search the RBE package index" aria-label="Search packages" />
          <button className="button primary" type="submit">Search</button>
        </form>
        <div className="registry-connection"><span className={live ? "connection-dot live" : "connection-dot fallback"}/>{live ? "Live Kastrick package index" : "Registry unavailable · showing cached preview data"}</div>
      </section>

      <section className="section-heading-row explore-heading">
        <div><span className="eyebrow">{query ? "Search results" : "Popular"}</span><h2>{query ? `Packages matching “${q}”` : "Top packages"}</h2></div>
        <span className="result-count">{filtered.length} package{filtered.length === 1 ? "" : "s"}</span>
      </section>

      {filtered.length ? (
        <section className="explore-grid">
          {filtered.map((pkg, index) => (
            <Link href={`/packages/${encodeURIComponent(pkg.name)}`} className="explore-package-card" key={pkg.name}>
              <div className="package-rank">#{index + 1}</div>
              <div className="explore-package-copy">
                <div className="explore-package-title"><h3>{pkg.name}</h3><span className={`status ${pkg.status.toLowerCase()}`}>{pkg.status}</span></div>
                <p>{pkg.description}</p>
                <div className="explore-package-meta"><span>{pkg.version}</span><span>{pkg.language}</span><span>{pkg.downloads.toLocaleString()} downloads</span><span>{pkg.versions} versions</span></div>
              </div>
              <span className="explore-arrow">→</span>
            </Link>
          ))}
        </section>
      ) : (
        <section className="empty-public-state"><strong>No packages found.</strong><p>Try another package name or browse the full index.</p><Link className="button" href="/explore">Clear search</Link></section>
      )}
    </>
  );
}
