import { notFound } from "next/navigation";
import { DeployLauncher } from "./deploy-launcher";
import { DeployMonitor } from "./deploy-monitor";
import { resolveDeployment } from "@/lib/mock-data";

export default async function DeployPage({ searchParams }: { searchParams: Promise<{ account?: string; deployid?: string }> }) {
  const query = await searchParams;

  if (!query.account && !query.deployid) {
    return <DeployLauncher />;
  }

  const account = query.account;
  const deployId = query.deployid;
  if (!account || !deployId) {
    return notFound();
  }

  const deployment = resolveDeployment(account, deployId);
  if (!deployment) {
    return notFound();
  }

  return <DeployMonitor deployment={deployment} requestedId={deployId} />;
}
