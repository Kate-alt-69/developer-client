import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashShell } from "@/components/dash-shell";
import { DEVELOPER_SESSION_COOKIE, resolveDeveloperSession } from "@/lib/uac";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(DEVELOPER_SESSION_COOKIE)?.value;
  if (!sessionToken) {
    redirect("/auth/login");
  }

  try {
    const session = await resolveDeveloperSession(sessionToken);
    if (session.body.ok !== true) {
      redirect("/auth/login");
    }
  } catch {
    redirect("/auth/login");
  }

  return <DashShell>{children}</DashShell>;
}
