import Link from "next/link";
import { DashboardDeploymentsClient } from "../../deployments/deployments-client";

export default async function PackageDeploymentsPage({ params }: { params: Promise<{ package: string }> }) {
  const { package: packageName } = await params;

  return (
    <>
      <section className="dash-page-heading split">
        <div><span className="kicker">{packageName}</span><h1>Deployments</h1><p>Durable validation, build, and publication attempts for this package.</p></div>
        <Link className="button primary" href="/dash/new-package">+ New deployment</Link>
      </section>
      <DashboardDeploymentsClient packageName={packageName} />
    </>
  );
}
