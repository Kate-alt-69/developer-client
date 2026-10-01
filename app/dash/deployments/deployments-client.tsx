"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Deployment = {
  deploymentId: string;
  accountPublicId: string;
  package?: string | null;
  repository: string;
  provider: string;
  gitRef: string;
  status: string;
  stage: string;
  createdAt: number;
  updatedAt: number;
};

type DeploymentResponse = {
  ok?: boolean;
  accountPublicId?: string;
  deployments?: Deployment[];
  error?: string;
};

function dateText(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "Unknown time";
  return new Date(value * 1000).toLocaleString();
}

export function DashboardDeploymentsClient({ packageName }: { packageName?: string }) {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const query = packageName ? `?package=${encodeURIComponent(packageName)}` : "";
        const response = await fetch(`/api/developer/deployments${query}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const body = await response.json() as DeploymentResponse;
        if (!response.ok || body.ok !== true) {
          setError(body.error === "invalid_session" ? "Your developer session expired. Sign in again." : "Could not load deployments.");
          setState("error");
          return;
        }
        setDeployments(Array.isArray(body.deployments) ? body.deployments : []);
        setState("ready");
      } catch (fetchError) {
        if (controller.signal.aborted) return;
        setError(fetchError instanceof Error ? fetchError.message : "Could not reach deployment storage.");
        setState("error");
      }
    })();
    return () => controller.abort();
  }, [packageName]);

  if (state === "loading") {
    return <section className="deployment-list panel"><div className="empty-state"><strong>Loading deployments…</strong><span>Reading your durable RPX deployment history.</span></div></section>;
  }
  if (state === "error") {
    return <section className="deployment-list panel"><div className="empty-state"><strong>Deployment history unavailable</strong><span>{error}</span></div></section>;
  }
  if (deployments.length === 0) {
    return <section className="deployment-list panel"><div className="empty-state"><strong>No deployments yet.</strong><span>{packageName ? `No deployment history exists for ${packageName} yet.` : "Create a package deployment to start a build history."}</span><Link className="button primary" href="/dash/new-package">Upload New Package</Link></div></section>;
  }

  return (
    <section className="deployment-list panel">
      {deployments.map((deploy) => (
        <Link
          className="deployment-row"
          key={deploy.deploymentId}
          href={`/deploy?account=${encodeURIComponent(deploy.accountPublicId)}&deployid=${encodeURIComponent(deploy.deploymentId)}`}
        >
          <div>
            <strong>{deploy.package || "Unassigned package"}</strong>
            <span>{deploy.repository}</span>
          </div>
          <div>
            <code>{deploy.provider}</code>
            <span>{deploy.gitRef}</span>
          </div>
          <div>
            <span className={`deploy-status ${deploy.status}`}><i />{deploy.status}</span>
            <small>{deploy.stage} · {dateText(deploy.updatedAt || deploy.createdAt)}</small>
          </div>
          <b>→</b>
        </Link>
      ))}
    </section>
  );
}
