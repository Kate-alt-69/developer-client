import Link from "next/link";
import { notFound } from "next/navigation";
import { deployments, findPackage } from "@/lib/mock-data";

export default async function PackageDeploymentsPage({ params }: { params: Promise<{ package: string }> }) {
  const { package: packageName } = await params;
  const pkg = findPackage(packageName);
  if (!pkg) return notFound();
  const rows = deployments.filter((deployment) => deployment.packageName === pkg.name);

  return (
    <>
      <section className="dash-page-heading split"><div><span className="kicker">{pkg.name}</span><h1>Deployments</h1><p>Validation and publish attempts for this package.</p></div><Link className="button primary" href={`/deploy?account=pub_kate_69&deployid=dpl_preview_${pkg.name}`}>+ New deployment</Link></section>
      <section className="deployment-list panel">
        {rows.length ? rows.map((deploy) => <Link className="deployment-row" key={deploy.id} href={`/deploy?account=${encodeURIComponent(deploy.account)}&deployid=${encodeURIComponent(deploy.id)}`}><div><strong>{deploy.packageName}@{deploy.version}</strong><span>{deploy.id}</span></div><div><code>{deploy.commit}</code><span>{deploy.branch}</span></div><div><span className={`deploy-status ${deploy.status}`}><i/>{deploy.status}</span><small>{deploy.createdAt}</small></div><b>→</b></Link>) : <div className="empty-inline-state">No deployments for this package yet.</div>}
      </section>
    </>
  );
}
