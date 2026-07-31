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
				{/* Page content */}
				<main className="py-8 px-4 sm:px-6 lg:px-8">
					<Suspense>{children}</Suspense>
				</main>
			</DashboardLayout>
		</ClerkProvider>
	);
}
