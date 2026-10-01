import Link from "next/link";
import { DashboardDeploymentsClient } from "./deployments-client";

export default function DashboardDeploymentsPage() {
  return (
    <>
      <section className="dash-page-heading split">
        <div>
          <span className="kicker">Deployments</span>
          <h1>All deployments</h1>
          <p>Durable validation, build, artifact and registry-publication attempts for this UAC owner.</p>
        </div>
        <Link className="button primary" href="/dash/new-package">+ New deployment</Link>
      </section>
      <DashboardDeploymentsClient />
    </>
  );
}
