import { NewPackageForm } from "./new-package-form";

export default function NewPackagePage() {
  return (
    <>
      <section className="dash-page-heading">
        <span className="kicker">New package</span>
        <h1>Upload New Package</h1>
        <p>Connect a public Git repository and create a durable RBE deployment with explicit source and build settings.</p>
      </section>
      <NewPackageForm />
    </>
  );
}
