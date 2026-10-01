import Link from "next/link";
import { notFound } from "next/navigation";
import { DownloadChart } from "@/components/download-chart";
import { findPackage } from "@/lib/mock-data";

export default async function DashboardPackagePage({ params }: { params: Promise<{ package: string }> }) {
  const { package: packageName } = await params;
  const pkg = findPackage(packageName);
  if (!pkg) return notFound();

  return (
    <>
      <section className="dash-page-heading split"><div><span className="kicker">Package</span><h1>{pkg.name}</h1><p>{pkg.description}</p><div className="meta-line"><span>{pkg.language}</span><span>{pkg.version}</span><a href={pkg.repository} target="_blank" rel="noreferrer">Repository ↗</a></div></div><div className="button-row"><Link className="button" href={`/packages/${pkg.name}`}>Public page</Link><Link className="button primary" href={`/deploy?account=pub_kate_69&deployid=dpl_preview_${pkg.name}`}>Deploy →</Link></div></section>
      <section className="stats-grid compact"><div className="mini-stat"><strong>{pkg.downloads.toLocaleString()}</strong><span>downloads</span></div><div className="mini-stat"><strong>{pkg.versions}</strong><span>versions</span></div><div className="mini-stat"><strong>{pkg.events}</strong><span>index events</span></div><div className="mini-stat"><strong>{pkg.status}</strong><span>package state</span></div></section>
      <section className="panel chart-panel"><div className="panel-head"><div><span className="eyebrow">Analytics</span><h2>Downloads</h2></div><Link className="text-link" href={`/dash/${pkg.name}/releases`}>View releases →</Link></div><DownloadChart /></section>
      <div className="dash-package-actions-grid"><Link href={`/dash/${pkg.name}/deployments`} className="landing-card"><span className="eyebrow">Deployments</span><h2>Build history</h2><p>Inspect validations, logs, build output, and package publication attempts.</p></Link><Link href={`/dash/${pkg.name}/setting`} className="landing-card"><span className="eyebrow">Settings</span><h2>Source & automation</h2><p>Configure root directory, build defaults, Git provider, and automatic releases.</p></Link></div>
    </>
  );
}
