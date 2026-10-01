import Link from "next/link";
import { notFound } from "next/navigation";
import { DownloadChart } from "@/components/download-chart";
import { findPackage, versions, type PackageRecord } from "@/lib/mock-data";

export default async function PackagePage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const found = findPackage(name);
  if (!found) {
    return notFound();
  }
  const pkg: PackageRecord = found;

  return <>
    <section className="page-heading package-heading">
      <div className="package-heading-main">
        <div className="breadcrumb"><Link href="/packages">Packages</Link><span>/</span><span>{pkg.name}</span></div>
        <div className="title-line"><h1>{pkg.name}</h1><span className={`status ${pkg.status.toLowerCase()}`}>{pkg.status}</span></div>
        <p>{pkg.description}</p>
        <div className="meta-line"><span>{pkg.language}</span><span>Public</span><a href={pkg.repository} target="_blank" rel="noreferrer">Repository ↗</a></div>
      </div>
      <div className="button-row package-actions">
        <a className="button ghost" href={`/api/packages/${pkg.name}/latest/download`}>↓ Download .rbe.zip</a>
        <Link className="button primary" href={`/deploy?account=pub_kate_69&deployid=dpl_preview_${pkg.name}`}>Publish new version</Link>
      </div>
    </section>

    <section className="stats-grid compact">
      <div className="mini-stat"><strong>{pkg.downloads.toLocaleString()}</strong><span>downloads</span></div>
      <div className="mini-stat"><strong>{pkg.versions}</strong><span>versions</span></div>
      <div className="mini-stat"><strong>{pkg.events}</strong><span>index events</span></div>
      <div className="mini-stat"><strong>184</strong><span>latest revision</span></div>
    </section>

    <section className="panel chart-panel">
      <div className="panel-head"><div><span className="eyebrow">Analytics</span><h2>Downloads</h2></div><div className="segmented"><button>7d</button><button className="selected">30d</button><button>90d</button><button>All</button></div></div>
      <DownloadChart />
    </section>

    <div className="two-col package-detail">
      <section className="panel section-panel">
        <div className="panel-head"><div><span className="eyebrow">Releases</span><h2>Versions</h2></div></div>
        {versions.map(v => <div className="version-row" key={v.version}>
          <div><strong>{v.version}</strong>{v.badge && <span className="tiny-badge">{v.badge}</span>}</div>
          <span>{v.downloads.toLocaleString()} downloads</span>
          <span>{v.date}</span>
          <a className="icon-button" aria-label={`Download ${pkg.name} ${v.version}`} href={`/api/packages/${pkg.name}/${v.version}/download`}>↓</a>
        </div>)}
      </section>
      <section className="panel section-panel">
        <div className="panel-head"><div><span className="eyebrow">Registry</span><h2>Index history</h2></div></div>
        <div className="history">
          <div><b>rev 184</b><span>Published {pkg.name}@0.4.2</span></div>
          <div><b>rev 181</b><span>Published {pkg.name}@0.4.1</span></div>
          <div><b>rev 177</b><span>Deprecated {pkg.name}@0.2.x</span></div>
          <div><b>rev 176</b><span>Published {pkg.name}@0.4.0</span></div>
        </div>
      </section>
    </div>
  </>;
}
