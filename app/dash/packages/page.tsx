import Link from "next/link";
import { packages } from "@/lib/mock-data";

export default function DashboardPackagesPage() {
  return (
    <>
      <section className="dash-page-heading split"><div><span className="kicker">Packages</span><h1>Your packages</h1><p>Manage release history, automation, source settings, and package health.</p></div><Link className="button primary" href="/dash/new-package">+ Upload New Package</Link></section>
      <section className="panel dash-table-panel">
        <div className="table-head"><span>Package</span><span>Latest</span><span>Downloads</span><span>Versions</span><span>Status</span><span/></div>
        {packages.map(pkg => <Link className="table-row" href={`/dash/${pkg.name}`} key={pkg.name}><div><strong>{pkg.name}</strong><small>{pkg.language}</small></div><span>{pkg.version}</span><span>{pkg.downloads.toLocaleString()}</span><span>{pkg.versions}</span><span><i className={`status ${pkg.status.toLowerCase()}`}>{pkg.status}</i></span><b>→</b></Link>)}
      </section>
    </>
  );
}
