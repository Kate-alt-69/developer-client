import Link from "next/link";

export default function PackageNotFound() {
  return <div className="not-found-shell">
    <div className="not-found-code">404</div>
    <h1>Package not found.</h1>
    <p>That package does not exist in the RBE index, or it is not visible to this developer account.</p>
    <div className="button-row centered"><Link className="button primary" href="/packages">Back to packages</Link><Link className="button ghost" href="/deploy">Add a package</Link></div>
  </div>;
}
