import Link from "next/link";
import { deployments } from "@/lib/mock-data";

export default function DashboardDeploymentsPage() {
  return (
    <>
      <section className="dash-page-heading split"><div><span className="kicker">Deployments</span><h1>All deployments</h1><p>Every validation, build, package artifact, and registry publication attempt.</p></div><Link className="button primary" href="/dash/new-package">+ New deployment</Link></section>
      <section className="deployment-list panel">
        {deployments.map((deploy) => <Link className="deployment-row" key={deploy.id} href={`/deploy?account=${encodeURIComponent(deploy.account)}&deployid=${encodeURIComponent(deploy.id)}`}>
          <div><strong>{deploy.packageName}@{deploy.version}</strong><span>{deploy.repo}</span></div>
          <div><code>{deploy.commit}</code><span>{deploy.branch}</span></div>
          <div><span className={`deploy-status ${deploy.status}`}><i/>{deploy.status}</span><small>{deploy.createdAt}</small></div>
          <b>→</b>
        </Link>)}
      </section>
    </>
  );
}
