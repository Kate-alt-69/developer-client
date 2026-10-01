import Link from "next/link";
import { DownloadChart } from "@/components/download-chart";
import { StatCard } from "@/components/stat-card";
import { activity, packages } from "@/lib/mock-data";

export default function OverviewPage() {
  return (
    <>
      <section className="page-heading split">
        <div><span className="kicker">Overview</span><h1>Good afternoon, Kate.</h1><p>Your packages, downloads and registry activity — nothing else.</p></div>
        <Link className="button primary" href="/deploy">+ Add package</Link>
      </section>

      <section className="stats-grid">
        <StatCard label="Downloads" value="48,291" detail="+12% in 30 days" />
        <StatCard label="Packages" value="6" detail="5 active" />
        <StatCard label="Versions" value="34" detail="+3 this month" />
        <StatCard label="Index events" value="91" detail="revision 184" />
      </section>

      <section className="panel chart-panel">
        <div className="panel-head"><div><span className="eyebrow">Downloads</span><h2>30 day activity</h2></div><div className="segmented"><button>7d</button><button className="selected">30d</button><button>90d</button></div></div>
        <DownloadChart />
      </section>

      <div className="two-col">
        <section className="panel">
          <div className="panel-head"><h2>Your packages</h2><Link className="text-link" href="/packages">View all</Link></div>
          <div className="list">{packages.map((pkg) => <Link className="package-row" href={`/packages/${pkg.name}`} key={pkg.name}><div><strong>{pkg.name}</strong><span>{pkg.language} · {pkg.version}</span></div><div className="package-meta"><span>{pkg.downloads.toLocaleString()} downloads</span><span className={`status ${pkg.status.toLowerCase()}`}>{pkg.status}</span><b>→</b></div></Link>)}</div>
        </section>
        <section className="panel">
          <div className="panel-head"><h2>Recent activity</h2></div>
          <div className="activity-list">{activity.map(([label,time]) => <div className="activity-row" key={label}><span className="activity-dot"/><div><strong>{label}</strong><small>{time}</small></div></div>)}</div>
        </section>
      </div>
    </>
  );
}
