import { KastrickProfileEditor } from "@/components/KastrickProfile";
export default function AccountPage() {
	return <section><span className="kicker">KA · Kastrick Account</span><h1>Your profile, everywhere.</h1><p>Profile changes sync with Engine Studio and your connected Kastrick apps.</p><KastrickProfileEditor /></section>;
}
