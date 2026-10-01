import { KASTRICK_BACKEND } from "@/lib/config";
import { packages as fallbackPackages } from "@/lib/mock-data";

export type RegistryVersion = {
  version: string;
  downloads?: number;
  deprecated?: boolean;
  yanked?: boolean;
};

export type RegistryPackage = {
  name: string;
  version: string;
  downloads: number;
  versions: number;
  status: "Healthy" | "Deprecated";
  language: string;
  description: string;
  repository?: string;
  events?: number;
  revision?: string | number;
  versionList?: RegistryVersion[];
};

function asNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return fallback;
}

function versionsFrom(raw: any): RegistryVersion[] {
  const source = raw?.versions ?? raw?.releases ?? raw?.history?.versions;
  if (Array.isArray(source)) {
    return source.map((entry: any) => typeof entry === "string"
      ? { version: entry }
      : {
          version: String(entry?.version ?? entry?.name ?? "unknown"),
          downloads: asNumber(entry?.downloads, undefined as any),
          deprecated: Boolean(entry?.deprecated),
          yanked: Boolean(entry?.yanked),
        }).filter((entry: RegistryVersion) => entry.version !== "unknown");
  }
  if (source && typeof source === "object") {
    return Object.entries(source).map(([version, entry]: [string, any]) => ({
      version,
      downloads: asNumber(entry?.downloads, undefined as any),
      deprecated: Boolean(entry?.deprecated),
      yanked: Boolean(entry?.yanked),
    }));
  }
  return [];
}

function normalizePackage(nameHint: string | undefined, raw: any): RegistryPackage | null {
  const packageRoot = raw?.package && typeof raw.package === "object" ? raw.package : raw;
  const name = String(packageRoot?.name ?? raw?.name ?? nameHint ?? "").trim();
  if (!name) return null;

  const versionList = versionsFrom(raw);
  const latest = String(
    packageRoot?.version ?? raw?.latest ?? raw?.latest_version ?? raw?.latestVersion ?? versionList[0]?.version ?? "latest"
  );
  const deprecated = Boolean(raw?.deprecated ?? packageRoot?.deprecated) || String(raw?.status ?? "").toLowerCase() === "deprecated";

  return {
    name,
    version: latest,
    downloads: asNumber(raw?.downloads ?? raw?.download_count ?? raw?.analytics?.downloads),
    versions: asNumber(raw?.version_count ?? raw?.versions_count, versionList.length || 1),
    status: deprecated ? "Deprecated" : "Healthy",
    language: String(packageRoot?.language ?? raw?.language ?? "RBE"),
    description: String(packageRoot?.description ?? raw?.description ?? "Public package on the RBE package index."),
    repository: raw?.repository ?? raw?.repo ?? packageRoot?.repository,
    events: asNumber(raw?.index_events ?? raw?.events),
    revision: raw?.revision ?? raw?.index_revision,
    versionList,
  };
}

function fallback(): RegistryPackage[] {
  return fallbackPackages.map((pkg) => ({
    name: pkg.name,
    version: pkg.version,
    downloads: pkg.downloads,
    versions: pkg.versions,
    status: pkg.status,
    language: pkg.language,
    description: pkg.description,
    repository: pkg.repository,
    events: pkg.events,
  }));
}

export async function getRegistryPackages(): Promise<{ packages: RegistryPackage[]; live: boolean }> {
  try {
    const response = await fetch(`${KASTRICK_BACKEND}/api/rpx/index?index-list`, {
      next: { revalidate: 60 },
      headers: { accept: "application/json" },
    });
    if (!response.ok) throw new Error(`registry responded ${response.status}`);
    const payload: any = await response.json();

    let candidates: RegistryPackage[] = [];
    const source = payload?.packages ?? payload?.index ?? payload?.data ?? payload;
    if (Array.isArray(source)) {
      candidates = source.map((entry: any) => normalizePackage(undefined, entry)).filter(Boolean) as RegistryPackage[];
    } else if (source && typeof source === "object") {
      candidates = Object.entries(source)
        .filter(([key]) => !["revision", "format", "generated_at", "generatedAt"].includes(key))
        .map(([name, entry]) => normalizePackage(name, entry))
        .filter(Boolean) as RegistryPackage[];
    }

    if (!candidates.length) throw new Error("registry index contained no packages");
    return { packages: candidates, live: true };
  } catch {
    return { packages: fallback(), live: false };
  }
}

export async function getRegistryPackage(name: string): Promise<{ package: RegistryPackage | null; live: boolean }> {
  try {
    const response = await fetch(`${KASTRICK_BACKEND}/api/rpx/index/package/status?pk=${encodeURIComponent(name)}`, {
      next: { revalidate: 30 },
      headers: { accept: "application/json" },
    });
    if (!response.ok) {
      if (response.status === 404) return { package: null, live: true };
      throw new Error(`registry responded ${response.status}`);
    }
    const payload: any = await response.json();
    const normalized = normalizePackage(name, payload);
    if (normalized) return { package: normalized, live: true };
  } catch {
    // fall through to the local fallback data
  }

  const found = fallback().find((pkg) => pkg.name.toLowerCase() === name.toLowerCase()) ?? null;
  return { package: found, live: false };
}
