import Link from "next/link";
import { DashboardPackagesClient } from "./packages-client";

export default function DashboardPackagesPage() {
  return (
    <>
      <section className="dash-page-heading split">
        <div>
          <span className="kicker">Packages</span>
          <h1>Your packages</h1>
          <p>Live RPX ownership for the global UAC account signed into this Developer Portal session.</p>
        </div>
        <Link className="button primary" href="/dash/new-package">+ Upload New Package</Link>
      </section>
      <DashboardPackagesClient />
    </>
  );
}
