import { notFound } from "next/navigation";
import { DeployLauncher } from "./deploy-launcher";
import { DeployMonitor } from "./deploy-monitor";

export default async function DeployPage({ searchParams }: { searchParams: Promise<{ account?: string; deployid?: string }> }) {
  const query = await searchParams;

  if (!query.account && !query.deployid) {
    return <DeployLauncher />;
  }

  const account = query.account?.trim();
  const deployId = query.deployid?.trim();
  if (!account || !deployId) {
    return notFound();
  }

  return <DeployMonitor account={account} requestedId={deployId} />;
}
