"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type OwnedPackage = {
  name: string;
  latestStable?: string | null;
  versions?: string[];
};

type OwnedPackagesResponse = {
  ok?: boolean;
  revision?: string;
  packages?: OwnedPackage[];
  error?: string;
};

function errorMessage(error?: string): string {
  if (error === "invalid_session" || error === "unauthorized") return "Your developer session expired. Sign in again.";
  if (error === "token_expired") return "Your package authorization expired. Refresh to reconnect it.";
  return "Could not load your packages from the RPX registry.";
}

export function DashboardPackagesClient() {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [packages, setPackages] = useState<OwnedPackage[]>([]);
  const [revision, setRevision] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch("/api/developer/packages", {
          cache: "no-store",
          signal: controller.signal,
        });
        const body = await response.json() as OwnedPackagesResponse;
        if (!response.ok || body.ok !== true) {
          setError(errorMessage(body.error));
          setState("error");
          return;
        }
        setPackages(Array.isArray(body.packages) ? body.packages : []);
        setRevision(typeof body.revision === "string" ? body.revision : "");
        setState("ready");
      } catch (fetchError) {
        if (controller.signal.aborted) return;
        setError(fetchError instanceof Error ? fetchError.message : "Could not reach the package registry.");
        setState("error");
      }
    })();
    return () => controller.abort();
  }, []);

  if (state === "loading") {
    return <section className="panel dash-table-panel"><div className="empty-state"><strong>Loading your packages…</strong><span>Resolving your global UAC identity against RPX ownership.</span></div></section>;
  }

  if (state === "error") {
    return <section className="panel dash-table-panel"><div className="empty-state"><strong>Package registry unavailable</strong><span>{error}</span></div></section>;
  }

  if (packages.length === 0) {
    return (
      <section className="panel dash-table-panel">
        <div className="empty-state">
          <strong>No packages yet.</strong>
          <span>Your UAC account does not own an RPX package yet.</span>
          <Link className="button primary" href="/dash/new-package">Upload New Package</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="panel dash-table-panel">
      <div className="table-head"><span>Package</span><span>Latest stable</span><span>Versions</span><span>Ownership</span><span>Registry</span><span /></div>
      {packages.map((pkg) => (
        <Link className="table-row" href={`/dash/${encodeURIComponent(pkg.name)}`} key={pkg.name}>
          <div><strong>{pkg.name}</strong><small>RPX package</small></div>
          <span>{pkg.latestStable || "No stable release"}</span>
          <span>{Array.isArray(pkg.versions) ? pkg.versions.length : 0}</span>
          <span><i className="status published">Owned</i></span>
          <span>{revision ? revision.slice(0, 12) : "current"}</span>
          <b>→</b>
        </Link>
      ))}
    </section>
  );
}
