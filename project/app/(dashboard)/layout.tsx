import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import type React from "react";
import { Suspense } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";

export default async function HomeLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	await auth.protect();
	return (
		<ClerkProvider>
			<DashboardLayout>
				<Suspense>{children}</Suspense>
			</DashboardLayout>
		</ClerkProvider>
	);
}
