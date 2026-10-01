import { PackageSettingsClient } from "./settings-client";

export default async function PackageSettingsPage({ params }: { params: Promise<{ package: string }> }) {
  const { package: packageName } = await params;

  return (
    <>
      <section className="dash-page-heading">
        <span className="kicker">{packageName}</span>
        <h1>Settings</h1>
        <p>Control source, build defaults, package metadata, and Git-triggered release policy for future deployments.</p>
      </section>
      <PackageSettingsClient packageName={packageName} />
    </>
  );
}
