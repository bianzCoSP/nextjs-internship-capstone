import { ClerkProvider } from "@clerk/nextjs";
import type React from "react";
import { Suspense } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function HomeLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ClerkProvider>
			<Suspense fallback={null}>
				<DashboardLayout>{children}</DashboardLayout>
			</Suspense>
		</ClerkProvider>
	);
}
