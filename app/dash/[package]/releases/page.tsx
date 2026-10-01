import { notFound } from "next/navigation";
import { findPackage, versions } from "@/lib/mock-data";

export default async function PackageReleasesPage({ params }: { params: Promise<{ package: string }> }) {
  const { package: packageName } = await params;
  const pkg = findPackage(packageName);
  if (!pkg) return notFound();

  return (
    <>
      <section className="dash-page-heading"><span className="kicker">{pkg.name}</span><h1>Releases</h1><p>Immutable package versions and their current registry state.</p></section>
      <section className="panel section-panel">
        <div className="release-table-head"><span>Version</span><span>Downloads</span><span>Published</span><span>State</span></div>
        {versions.map((version) => <div className="release-table-row" key={version.version}><strong>{version.version}</strong><span>{version.downloads.toLocaleString()}</span><span>{version.date}</span><span className="status healthy">{version.badge || "Active"}</span></div>)}
      </section>
    </>
  );
}
