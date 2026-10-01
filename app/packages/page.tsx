import Link from "next/link";
import { packages } from "@/lib/mock-data";

export default function PackagesPage() {
  return <>
    <section className="page-heading split"><div><span className="kicker">Packages</span><h1>Everything you publish.</h1><p>Versions, downloads, registry history and security state in one place.</p></div><Link className="button primary" href="/deploy">+ Add package</Link></section>
    <section className="panel">
      <div className="table-head"><span>Package</span><span>Latest</span><span>Downloads</span><span>Versions</span><span>Status</span><span/></div>
      {packages.map(pkg => <Link className="table-row" href={`/packages/${pkg.name}`} key={pkg.name}><div><strong>{pkg.name}</strong><small>{pkg.language}</small></div><span>{pkg.version}</span><span>{pkg.downloads.toLocaleString()}</span><span>{pkg.versions}</span><span><i className={`status ${pkg.status.toLowerCase()}`}>{pkg.status}</i></span><b>→</b></Link>)}
    </section>
  </>
}
