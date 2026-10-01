export type PackageRecord = {
  name: string;
  version: string;
  downloads: number;
  status: "Healthy" | "Deprecated";
  language: string;
  versions: number;
  events: number;
  repository: string;
  description: string;
};

export const packages: PackageRecord[] = [
  {
    name: "mail",
    version: "0.4.2",
    downloads: 18294,
    status: "Healthy",
    language: "Rust",
    versions: 7,
    events: 14,
    repository: "https://github.com/Kate-alt-69/rbe-mail",
    description: "Email providers and delivery utilities for RBE packages.",
  },
  {
    name: "advancenet",
    version: "2.1.0",
    downloads: 12721,
    status: "Deprecated",
    language: "Rust",
    versions: 11,
    events: 29,
    repository: "https://github.com/Kate-alt-69/advancenet",
    description: "Network helpers and transport components for RBE.",
  },
  {
    name: "quickdb",
    version: "1.8.4",
    downloads: 9104,
    status: "Healthy",
    language: "TypeScript",
    versions: 16,
    events: 48,
    repository: "https://github.com/Kate-alt-69/quickdb",
    description: "Simple package-side database helpers.",
  },
];

export const activity = [
  ["mail@0.4.2 published", "14 min ago"],
  ["Registry index updated · revision 184", "14 min ago"],
  ["advancenet@1.x marked deprecated", "2 days ago"],
  ["mail@0.4.1 reached 10k downloads", "4 days ago"],
];

export const versions = [
  { version: "0.4.2", badge: "Latest", downloads: 6282, date: "Sep 30, 2026" },
  { version: "0.4.1", badge: "", downloads: 7101, date: "Sep 18, 2026" },
  { version: "0.4.0", badge: "", downloads: 3928, date: "Sep 02, 2026" },
  { version: "0.3.0", badge: "", downloads: 983, date: "Aug 19, 2026" },
];

export type DeployRecord = {
  id: string;
  account: string;
  packageName: string;
  version: string;
  repo: string;
  branch: string;
  commit: string;
  createdAt: string;
  registryRevision: number;
  status: "building" | "published" | "failed";
  failAt?: number;
};

export const deployments: DeployRecord[] = [
  {
    id: "dpl_185_mail",
    account: "pub_kate_69",
    packageName: "mail",
    version: "0.4.3",
    repo: "https://github.com/Kate-alt-69/rbe-mail",
    branch: "main",
    commit: "7c636fe",
    createdAt: "Just now",
    registryRevision: 185,
    status: "published",
  },
  {
    id: "dpl_184_quickdb",
    account: "pub_kate_69",
    packageName: "quickdb",
    version: "1.8.5",
    repo: "https://github.com/Kate-alt-69/quickdb",
    branch: "main",
    commit: "3f84d1a",
    createdAt: "2 hours ago",
    registryRevision: 184,
    status: "published",
  },
  {
    id: "dpl_fail_demo",
    account: "pub_kate_69",
    packageName: "broken-demo",
    version: "0.1.0",
    repo: "https://github.com/Kate-alt-69/broken-demo",
    branch: "main",
    commit: "bd90a12",
    createdAt: "Demo",
    registryRevision: 0,
    status: "failed",
    failAt: 2,
  },
];

export function findPackage(slug: string) {
  return packages.find((pkg) => pkg.name.toLowerCase() === slug.toLowerCase());
}

export function resolveDeployment(account: string, deployId: string): DeployRecord | null {
  if (account !== "pub_kate_69") return null;

  if (deployId === "latest") {
    return deployments.find((deployment) => deployment.account === account) ?? null;
  }

  const known = deployments.find((deployment) => deployment.account === account && deployment.id === deployId);
  if (known) return known;

  if (deployId.startsWith("dpl_preview_")) {
    const slug = deployId.slice("dpl_preview_".length).replace(/[^a-zA-Z0-9._-]/g, "") || "package";
    const existing = findPackage(slug);
    const version = existing ? existing.version.replace(/(\d+)$/, (value) => String(Number(value) + 1)) : "0.1.0";
    return {
      id: deployId,
      account,
      packageName: slug,
      version,
      repo: existing?.repository ?? `https://github.com/Kate-alt-69/${slug}`,
      branch: "main",
      commit: "pending",
      createdAt: "Just now",
      registryRevision: 186,
      status: slug.toLowerCase().includes("broken") ? "failed" : "building",
      failAt: slug.toLowerCase().includes("broken") ? 2 : undefined,
    };
  }

  return null;
}
