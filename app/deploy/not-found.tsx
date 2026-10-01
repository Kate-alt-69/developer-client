import Link from "next/link";

export default function DeployNotFound() {
  return <div className="not-found-shell">
    <div className="not-found-code">404</div>
    <h1>Deployment not found.</h1>
    <p>That account/deployment pair does not exist, or this deployment is no longer visible.</p>
    <div className="button-row centered"><Link className="button primary" href="/deploy">New deployment</Link><Link className="button ghost" href="/deploy?account=pub_kate_69&deployid=latest">Open latest</Link></div>
  </div>;
}
