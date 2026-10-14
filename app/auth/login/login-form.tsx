import { KastrickLogin } from "@/components/kastrick-login";

export function LoginForm({ nextPath }: { nextPath?: string }) {
	return <KastrickLogin mode="login" nextPath={nextPath} />;
}
