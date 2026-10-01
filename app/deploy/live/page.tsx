import { redirect } from "next/navigation";

export default function LegacyLiveDeployPage() {
  redirect("/deploy?account=pub_kate_69&deployid=latest");
}
