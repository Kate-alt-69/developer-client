"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type DeploymentLog = {
  seq: number;
  at: number;
  level: "info" | "warning" | "error" | "success" | string;
  stage: string;
  message: string;
};

type Deployment = {
  deploymentId: string;
  accountPublicId: string;
  package?: string | null;
  repository: string;
  provider: string;
  gitRef: string;
  trigger: string;
  build: {
    root: string;
    buildMode: string;
    checkCommand: string;
    buildCommand: string;
    ignoreWarnings: boolean;
  };
  status: "queued" | "running" | "published" | "failed" | "cancelled" | string;
  stage: string;
  executor: {
    name: string;
    ready: boolean;
    blockedReason?: string | null;
    managedRuntimes?: string[];
    policy?: string;
  };
  logs: DeploymentLog[];
  createdAt: number;
  updatedAt: number;
};

type DeploymentResponse = {
  ok?: boolean;
  deployment?: Deployment;
  error?: string;
  message?: string;
};

const stages = [
  { key: "awaiting_executor", title: "Executor", detail: "Reserve an RBE-managed build executor" },
  { key: "fetch", title: "Repository", detail: "Fetch the public repository" },
  { key: "checkout", title: "Checkout", detail: "Resolve and checkout the requested Git ref" },
  { key: "validation", title: "Validation", detail: "Run the package validation contract" },
  { key: "build", title: "Compile", detail: "Build declared package components" },
  { key: "security", title: "Security", detail: "Check package integrity and security policy" },
  { key: "package", title: "Artifact", detail: "Create the canonical RBE package artifact" },
  { key: "publish", title: "Registry", detail: "Commit the validated release to RPX" },
] as const;

const stageIndex = new Map(stages.map((stage, index) => [stage.key, index]));

function terminal(status: string): boolean {
  return status === "published" || status === "failed" || status === "cancelled";
}

function statusLabel(status: string): string {
  switch (status) {
    case "queued": return "Queued";
    case "running": return "Building";
    case "published": return "Published";
    case "failed": return "Failed";
    case "cancelled": return "Cancelled";
    default: return status || "Unknown";
  }
}

function statusClass(status: string): string {
  if (status === "published") return "published";
  if (status === "failed" || status === "cancelled") return "failed";
  return "building";
}

function repositoryName(repository: string): string {
  const last = repository.split("/").filter(Boolean).pop() || "deployment";
  return last.replace(/\.git$/i, "") || "deployment";
}

function logClass(level: string): string {
  if (level === "success") return "ok";
  if (level === "error") return "error";
  if (level === "warning") return "hint";
  return "info";
}

function formatLogTime(epochSeconds: number): string {
  if (!Number.isFinite(epochSeconds) || epochSeconds <= 0) return "--:--:--";
  return new Date(epochSeconds * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function messageFor(body: DeploymentResponse, status: number): string {
  if (status === 401 || body.error === "invalid_session" || body.error === "unauthorized") {
    return "Your developer session expired. Sign in again.";
  }
  if (status === 404 || body.error === "deployment_not_found") {
    return "This deployment does not exist for the signed-in developer account.";
  }
  return body.message || body.error?.replace(/_/g, " ") || "Could not load this deployment.";
}

function failureStage(deployment: Deployment): string | undefined {
  if (deployment.stage !== "failed" && deployment.stage !== "cancelled") return deployment.stage;
  for (let index = deployment.logs.length - 1; index >= 0; index -= 1) {
    const stage = deployment.logs[index]?.stage;
    if (stage && stage !== "failed" && stage !== "cancelled" && stageIndex.has(stage as typeof stages[number]["key"])) {
      return stage;
    }
  }
  return undefined;
}

export function DeployMonitor({ account, requestedId }: { account: string; requestedId: string }) {
  const [deployment, setDeployment] = useState<Deployment>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const logEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const load = async () => {
      try {
        const response = await fetch(`/api/developer/deployments?deployid=${encodeURIComponent(requestedId)}`, {
          cache: "no-store",
        });
        const body = await response.json() as DeploymentResponse;
        if (!response.ok || body.ok !== true || !body.deployment) {
          if (!stopped) setError(messageFor(body, response.status));
          return;
        }
        if (body.deployment.accountPublicId !== account) {
          if (!stopped) setError("This deployment does not belong to the requested account public ID.");
          return;
        }

        if (!stopped) {
          setDeployment(body.deployment);
          setError("");
          setLoading(false);
          if (!terminal(body.deployment.status)) {
            timer = setTimeout(load, 1800);
          }
        }
      } catch (loadError) {
        if (!stopped) {
          setError(loadError instanceof Error ? loadError.message : "Could not load this deployment.");
        }
      } finally {
        if (!stopped) setLoading(false);
      }
    };

    void load();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [account, requestedId]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ block: "nearest" });
  }, [deployment?.logs.length]);

  const effectiveStage = deployment ? failureStage(deployment) : undefined;
  const currentIndex = effectiveStage ? (stageIndex.get(effectiveStage as typeof stages[number]["key"]) ?? 0) : 0;
  const failed = deployment?.status === "failed";
  const cancelled = deployment?.status === "cancelled";
  const published = deployment?.status === "published";
  const stopped = failed || cancelled || published;

  const lastError = useMemo(() => {
    if (!deployment) return undefined;
    return [...deployment.logs].reverse().find((entry) => entry.level === "error");
  }, [deployment]);

  if (loading && !deployment) {
    return <div className="deployment-page"><section className="panel settings-card"><div className="empty-state"><strong>Loading deployment…</strong><span>Resolving the durable RPX deployment record.</span></div></section></div>;
  }

  if (!deployment) {
    return <div className="deployment-page">
      <div className="deploy-breadcrumb"><Link href="/dash/deployments">Deployments</Link><span>/</span><span>{requestedId}</span></div>
      <section className="panel settings-card"><div className="empty-state"><strong>Deployment unavailable</strong><span>{error || "No deployment record was returned."}</span></div></section>
    </div>;
  }

  const title = deployment.package || repositoryName(deployment.repository);
  const displayId = requestedId === "latest" ? `${deployment.deploymentId} (latest)` : deployment.deploymentId;
  const status = statusLabel(deployment.status);

  return <div className="deployment-page">
    <div className="deploy-breadcrumb"><Link href="/dash/deployments">Deployments</Link><span>/</span><span>{displayId}</span></div>

    <section className="deployment-header">
      <div>
        <div className="deploy-title-row"><h1>{title}</h1><span className={`deploy-status ${statusClass(deployment.status)}`}><i />{status}</span></div>
        <p>{failed
          ? "Publication stopped because the managed deployment reported a blocking failure."
          : cancelled
            ? "This deployment was cancelled before publication completed."
            : published
              ? "The managed deployment completed publication successfully."
              : deployment.executor.ready
                ? "RBE is processing this deployment using the managed executor."
                : "The deployment is durable and queued while it waits for the managed executor."}</p>
      </div>
      <div className="button-row">
        <a className="button ghost" href={deployment.repository} target="_blank" rel="noreferrer">Source ↗</a>
        {deployment.package ? <Link className="button ghost" href={`/packages/${encodeURIComponent(deployment.package)}`}>View package →</Link> : null}
      </div>
    </section>

    <section className="deployment-meta-strip">
      <div><span>Deployment</span><strong>{deployment.deploymentId}</strong></div>
      <div><span>Account</span><strong>{deployment.accountPublicId}</strong></div>
      <div><span>Provider</span><strong>{deployment.provider}</strong></div>
      <div><span>Git ref</span><strong>{deployment.gitRef}</strong></div>
    </section>

    <div className="deployment-grid">
      <aside className="panel deploy-rail">
        <div className="deploy-rail-head"><span className="eyebrow">Pipeline</span><h2>Checks</h2></div>
        <div className="stage-rail">
          {stages.map((stage, index) => {
            const isFailureStage = (failed || cancelled) && index === currentIndex;
            const isDone = published || (!isFailureStage && index < currentIndex);
            const isActive = !stopped && index === currentIndex;
            const state = isFailureStage ? "failed" : isDone ? "done" : isActive ? "active" : "pending";
            return <div className={`rail-stage ${state}`} key={stage.key}>
              <div className="rail-marker"><span>{isFailureStage ? "!" : isDone ? "✓" : index + 1}</span></div>
              <div><strong>{stage.title}</strong><p>{stage.detail}</p></div>
            </div>;
          })}
        </div>
      </aside>

      <section className="panel build-output-panel">
        <div className="build-output-head">
          <div><span className="eyebrow">Live output</span><h2>Build logs</h2></div>
          <div className="log-head-actions"><span className={`live-dot ${stopped ? "stopped" : ""}`} />{published ? "Completed" : failed || cancelled ? "Stopped" : "Streaming"}</div>
        </div>
        <div className="log-viewer" role="log" aria-live="polite">
          {deployment.logs.map((entry) => <div className={`log-line ${logClass(entry.level)}`} key={entry.seq}>
            <span className="log-time">{formatLogTime(entry.at)}</span>
            <span className="log-message"><b>[{entry.stage}]</b> {entry.message}</span>
          </div>)}
          {!deployment.logs.length ? <div className="log-line waiting"><span className="log-time">···</span><span className="log-message">Waiting for deployment output…</span></div> : null}
          {!stopped ? <div className="log-line waiting"><span className="log-time">···</span><span className="log-message">Current stage: {deployment.stage}</span></div> : null}
          <div ref={logEndRef} />
        </div>

        {!deployment.executor.ready && !stopped ? <div className="repo-policy">
          <span className="policy-icon">⏳</span>
          <div><strong>Waiting for managed executor</strong><p>{deployment.executor.blockedReason || "The RBE managed executor has not accepted this deployment yet."}</p></div>
        </div> : null}

        {(failed || cancelled) ? <div className="failure-card">
          <div className="failure-icon">!</div>
          <div><strong>{failed ? "Deployment failed" : "Deployment cancelled"}</strong><p>{lastError?.message || `The deployment stopped during ${effectiveStage || deployment.stage}.`}</p><code>stage: {effectiveStage || deployment.stage}</code></div>
        </div> : null}

        {published ? <div className="release-ready-card">
          <div className="release-check">✓</div>
          <div className="release-copy"><span className="eyebrow">Publication complete</span><strong>{deployment.package || title}</strong><p>The durable deployment reached the published state. Open the package page for release history and artifact downloads.</p></div>
          {deployment.package ? <div className="button-row"><Link className="button primary" href={`/packages/${encodeURIComponent(deployment.package)}`}>View package →</Link></div> : null}
        </div> : null}
      </section>
    </div>

    {error ? <p className="form-error" role="alert">{error}</p> : null}
  </div>;
}
