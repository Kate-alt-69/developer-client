import { KastrickLogin } from "@/components/kastrick-login";

export function SignupForm({ nextPath }: { nextPath?: string }) {
	return <KastrickLogin mode="signup" nextPath={nextPath} />;
}
