"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { DeployRecord } from "@/lib/mock-data";

const stages = [
  { title: "Repository", detail: "Fetch public repository and resolve HEAD" },
  { title: "Package", detail: "Read package manifest and component graph" },
  { title: "Validation", detail: "Run full RPX checks across the package" },
  { title: "Compile", detail: "Compile declared package components" },
  { title: "Security", detail: "Check integrity, signatures and RPER state" },
  { title: "Artifact", detail: "Build canonical .rbe.zip and package manifest" },
  { title: "Registry", detail: "Hash artifact and commit index revision" },
];

const logsByStage = [
  [
    ["12:41:03.041", "info", "Fetching repository from GitHub"],
    ["12:41:03.294", "info", "Resolved branch main"],
    ["12:41:03.486", "ok", "Repository checkout ready"],
  ],
  [
    ["12:41:03.521", "info", "Reading RBE package metadata"],
    ["12:41:03.557", "info", "Discovering components and exports"],
    ["12:41:03.601", "ok", "Package graph resolved"],
  ],
  [
    ["12:41:03.642", "cmd", "$ rpx check -all -ignore-warning"],
    ["12:41:03.714", "info", "Checking manifest, dependencies, components and capabilities"],
    ["12:41:04.004", "ok", "All blocking checks passed"],
  ],
  [
    ["12:41:04.051", "cmd", "$ rpx compile"],
    ["12:41:04.189", "info", "Compiler authority: RBE managed toolchain"],
    ["12:41:04.681", "ok", "Components compiled successfully"],
  ],
  [
    ["12:41:04.727", "info", "Checking local and current RPER package state"],
    ["12:41:04.838", "info", "Verifying dependency integrity and package signatures"],
    ["12:41:04.953", "ok", "No blocking Security notices"],
  ],
  [
    ["12:41:04.997", "info", "Creating canonical package.rbe.yaml"],
    ["12:41:05.146", "info", "Packing canonical .rbe.zip artifact"],
    ["12:41:05.309", "ok", "Artifact ready"],
  ],
  [
    ["12:41:05.342", "info", "Calculating artifact SHA-256"],
    ["12:41:05.448", "info", "Writing package release into frozen index revision"],
    ["12:41:05.571", "ok", "Registry publication complete"],
  ],
] as const;

const validationFailure = [
  ["12:41:03.642", "cmd", "$ rpx check -all -ignore-warning"],
  ["12:41:03.714", "info", "Checking manifest, dependencies, components and capabilities"],
  ["12:41:03.913", "error", "error[RPX1207]: unresolved package component import"],
  ["12:41:03.914", "error", " --> components/mail/mail.rs:42:9"],
  ["12:41:03.915", "error", "  |  import smtp_client"],
  ["12:41:03.916", "error", "  |         ^^^^^^^^^^^ no exported component named `smtp_client`"],
  ["12:41:03.917", "hint", "  = fix: export `smtp_client` or update this import"],
] as const;

type LogLine = readonly [string, string, string];

export function DeployMonitor({ deployment, requestedId }: { deployment: DeployRecord; requestedId: string }) {
  const initialStep = deployment.status === "published"
    ? stages.length
    : deployment.status === "failed"
      ? (deployment.failAt ?? 0) + 1
      : 0;
  const [step, setStep] = useState(initialStep);
  const [repo, setRepo] = useState(deployment.repo);
  const logEndRef = useRef<HTMLDivElement | null>(null);
  const failAt = deployment.failAt;
  const failed = typeof failAt === "number" && step > failAt;
  const done = !failed && step >= stages.length;

  useEffect(() => {
    const stored = sessionStorage.getItem(`rbe.deploy.repo.${deployment.id}`);
    if (stored) setRepo(stored);
  }, [deployment.id]);

  useEffect(() => {
    if (done || failed) return;
    const timer = window.setTimeout(() => setStep((current) => current + 1), 980);
    return () => window.clearTimeout(timer);
  }, [step, done, failed]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ block: "nearest" });
  }, [step]);

  const visibleLogs = useMemo(() => {
    const lines: LogLine[] = [];
    for (let index = 0; index < Math.min(step + 1, stages.length); index += 1) {
      if (typeof failAt === "number" && index === failAt) {
        lines.push(...validationFailure);
        break;
      }
      lines.push(...logsByStage[index]);
    }
    return lines;
  }, [step, failAt]);

  const status = failed ? "Failed" : done ? "Published" : "Building";

  return <div className="deployment-page">
    <div className="deploy-breadcrumb"><Link href="/deploy">Deployments</Link><span>/</span><span>{requestedId === "latest" ? `${deployment.id} (latest)` : deployment.id}</span></div>

    <section className="deployment-header">
      <div>
        <div className="deploy-title-row"><h1>{deployment.packageName}@{deployment.version}</h1><span className={`deploy-status ${status.toLowerCase()}`}><i />{status}</span></div>
        <p>{failed ? "Publication stopped because a blocking validation error was found." : done ? "This release is live in the RBE package index." : "RBE is validating and publishing this package now."}</p>
      </div>
      <div className="button-row">
        <a className="button ghost" href={repo} target="_blank" rel="noreferrer">Source ↗</a>
        {done && <a className="button ghost" href={`/api/packages/${deployment.packageName}/${deployment.version}/download`}>↓ .rbe.zip</a>}
      </div>
    </section>

    <section className="deployment-meta-strip">
      <div><span>Deployment</span><strong>{deployment.id}</strong></div>
      <div><span>Account</span><strong>{deployment.account}</strong></div>
      <div><span>Branch</span><strong>{deployment.branch}</strong></div>
      <div><span>Commit</span><strong>{deployment.commit}</strong></div>
    </section>

    <div className="deployment-grid">
      <aside className="panel deploy-rail">
        <div className="deploy-rail-head"><span className="eyebrow">Pipeline</span><h2>Checks</h2></div>
        <div className="stage-rail">
          {stages.map((stage, index) => {
            const isFailed = failed && index === failAt;
            const isDone = !isFailed && (index < step || done);
            const isActive = !done && !failed && index === step;
            const state = isFailed ? "failed" : isDone ? "done" : isActive ? "active" : "pending";
            return <div className={`rail-stage ${state}`} key={stage.title}>
              <div className="rail-marker"><span>{isFailed ? "!" : isDone ? "✓" : index + 1}</span></div>
              <div><strong>{stage.title}</strong><p>{stage.detail}</p></div>
            </div>;
          })}
        </div>
      </aside>

      <section className="panel build-output-panel">
        <div className="build-output-head">
          <div><span className="eyebrow">Live output</span><h2>Build logs</h2></div>
          <div className="log-head-actions"><span className={`live-dot ${done || failed ? "stopped" : ""}`} />{done ? "Completed" : failed ? "Stopped" : "Streaming"}</div>
        </div>
        <div className="log-viewer" role="log" aria-live="polite">
          {visibleLogs.map(([time, kind, message], index) => <div className={`log-line ${kind}`} key={`${time}-${index}`}>
            <span className="log-time">{time}</span>
            <span className="log-message">{message}</span>
          </div>)}
          {!done && !failed && <div className="log-line waiting"><span className="log-time">···</span><span className="log-message">{stages[Math.min(step, stages.length - 1)].detail}…</span></div>}
          <div ref={logEndRef} />
        </div>

        {failed && <div className="failure-card">
          <div className="failure-icon">!</div>
          <div><strong>Validation failed</strong><p>`rpx check -all` found a blocking error. Fix the highlighted source issue and deploy again.</p><code>RPX1207 · components/mail/mail.rs:42:9</code></div>
        </div>}

        {done && <div className="release-ready-card">
          <div className="release-check">✓</div>
          <div className="release-copy"><span className="eyebrow">Release ready</span><strong>{deployment.packageName}@{deployment.version}</strong><p>Registry revision {deployment.registryRevision} · canonical artifact is ready to install or download.</p></div>
          <div className="button-row"><a className="button ghost" href={`/api/packages/${deployment.packageName}/${deployment.version}/download`}>↓ Download .rbe.zip</a><Link className="button primary" href={`/packages/${deployment.packageName}`}>View package →</Link></div>
        </div>}
      </section>
    </div>
  </div>;
}
