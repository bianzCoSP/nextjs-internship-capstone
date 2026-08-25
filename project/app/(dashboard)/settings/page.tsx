import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
	return (
		<div className="h-full flex flex-col items-center justify-center space-y-6">
			<UserProfile routing="hash" />
		</div>
	);
}
