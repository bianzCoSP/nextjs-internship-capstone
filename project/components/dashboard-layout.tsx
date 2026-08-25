"use client";

import { UserButton } from "@clerk/nextjs";
import {
	BarChart3,
	Calendar,
	FolderOpen,
	Home,
	Menu,
	Settings,
	Users,
	X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useUIStore } from "@/stores/ui-store";
import { ThemeToggle } from "./theme-toggle";

const navigation = [
	{ name: "Dashboard", href: "/dashboard", icon: Home },
	{ name: "Projects", href: "/projects", icon: FolderOpen },
	{ name: "Team", href: "/team", icon: Users },
	{ name: "Analytics", href: "/analytics", icon: BarChart3 },
	{ name: "Calendar", href: "/calendar", icon: Calendar },
	{ name: "Settings", href: "/settings", icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
	const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
	const openSidebar = useUIStore((state) => state.openSidebar);
	const closeSidebar = useUIStore((state) => state.closeSidebar);
	const pathName = usePathname();

	return (
		<div className="h-screen overflow-hidden bg-platinum-900 dark:bg-outer_space-600">
			{/* Mobile sidebar overlay */}
			{isSidebarOpen && (
				<button
					type="button"
					aria-label="mobile sidebar"
					className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden cursor-default"
					onClick={closeSidebar}
				/>
			)}

			{/* Sidebar */}
			<div
				className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-outer_space-500 border-r border-french_gray-300 dark:border-paynes_gray-400 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
			>
				<div className="flex items-center justify-between h-16 px-6 border-b border-french_gray-300 dark:border-paynes_gray-400">
					<Link href="/" className="text-2xl font-bold text-blue_munsell-500">
						ProjectFlow
					</Link>
					<button
						type="button"
						onClick={closeSidebar}
						className="lg:hidden p-2 rounded-lg hover:bg-platinum-500 dark:hover:bg-paynes_gray-400"
					>
						<X size={20} />
					</button>
				</div>

				<nav className="mt-6 px-3">
					<ul className="space-y-1">
						{navigation.map((item) => {
							const isCurrent = pathName === item.href;
							return (
								<li key={item.name}>
									<Link
										href={item.href}
										onClick={closeSidebar}
										className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
											isCurrent
												? "bg-blue_munsell-100 dark:bg-blue_munsell-900 text-blue_munsell-700 dark:text-blue_munsell-300"
												: "text-outer_space-500 dark:text-platinum-500 hover:bg-platinum-500 dark:hover:bg-paynes_gray-400"
										}`}
									>
										<item.icon className="mr-3" size={20} />
										{item.name}
									</Link>
								</li>
							);
						})}
					</ul>
				</nav>
			</div>

			{/* Main content */}
			<div className="flex h-screen flex-col lg:pl-64">
				{/* Top bar */}
				<div className="shrink-0 sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-french_gray-300 dark:border-paynes_gray-400 bg-white dark:bg-outer_space-500 px-4 shadow-xs sm:gap-x-6 sm:px-6 lg:px-8">
					<button
						type="button"
						onClick={openSidebar}
						className="lg:hidden p-2 rounded-lg hover:bg-platinum-500 dark:hover:bg-paynes_gray-400"
					>
						<Menu size={20} />
					</button>

					<div className="flex flex-1 justify-end gap-x-4 self-stretch lg:gap-x-6">
						<div className="flex items-center gap-x-4 lg:gap-x-6">
							<ThemeToggle />

							<UserButton />
						</div>
					</div>
				</div>

				{/* Page content */}
				<main className="flex-1 min-h-0 overflow-y-auto py-8 px-4 sm:px-6 lg:px-8">
					{children}
				</main>
			</div>
		</div>
	);
}
