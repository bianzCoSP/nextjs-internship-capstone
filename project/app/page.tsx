import { Show, UserButton } from "@clerk/nextjs";
import { ArrowRight, Kanban, MoveRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
	return (
		<div className="flex min-h-screen flex-col bg-linear-to-br from-platinum-900 via-platinum-900 to-blue_munsell-50/40 dark:from-outer_space-500 dark:via-outer_space-500 dark:to-paynes_gray-500">
			{/* Header */}
			<header className="sticky top-0 z-50 border-b border-french_gray-300 dark:border-paynes_gray-400 bg-white/80 dark:bg-outer_space-500/80 backdrop-blur-md">
				<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
					<div className="flex items-center gap-2 text-xl font-bold tracking-tight text-outer_space-500 dark:text-platinum-500">
						<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue_munsell-500 text-white">
							<Kanban size={18} strokeWidth={2.5} />
						</span>
						ProjectFlow
					</div>
					<div className="flex items-center gap-6">
						<nav className="hidden items-center gap-6 sm:flex">
							<Link
								href="/dashboard"
								className="text-sm font-medium text-outer_space-500 dark:text-platinum-500 hover:text-blue_munsell-500 dark:hover:text-blue_munsell-300"
							>
								Dashboard
							</Link>
							<Link
								href="/projects"
								className="text-sm font-medium text-outer_space-500 dark:text-platinum-500 hover:text-blue_munsell-500 dark:hover:text-blue_munsell-300"
							>
								Projects
							</Link>
						</nav>
						<div className="flex items-center gap-3">
							<ThemeToggle />
							<Suspense>
								<Show when="signed-out">
									<Link
										href="/sign-in"
										className="hidden text-sm font-medium text-outer_space-500 dark:text-platinum-500 hover:text-blue_munsell-500 dark:hover:text-blue_munsell-300 sm:inline-block"
									>
										Sign In
									</Link>
									<Link
										href="/sign-up"
										className="inline-flex items-center rounded-lg bg-blue_munsell-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue_munsell-600"
									>
										Get Started
									</Link>
								</Show>
								<Show when="signed-in">
									<UserButton />
								</Show>
							</Suspense>
						</div>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="relative flex flex-1 items-center overflow-hidden">
				<div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-40 dark:opacity-20" />

				<div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
					<div className="text-center lg:text-left">
						<div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-blue_munsell-300/40 bg-blue_munsell-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue_munsell-600 dark:border-blue_munsell-400/30 dark:bg-blue_munsell-900/30 dark:text-blue_munsell-300">
							Project management, simplified
						</div>

						<h1
							className="animate-fade-up text-5xl font-bold tracking-tight text-outer_space-500 dark:text-platinum-500 md:text-6xl"
							style={{ animationDelay: "80ms" }}
						>
							Boards that keep
							<span className="block text-blue_munsell-500">
								your team in sync
							</span>
						</h1>

						<p
							className="animate-fade-up mx-auto mt-6 max-w-xl text-lg text-paynes_gray-500 dark:text-french_gray-500 lg:mx-0"
							style={{ animationDelay: "160ms" }}
						>
							Organize tasks, collaborate with your team, and track progress
							with a drag-and-drop kanban board built for how projects actually
							move.
						</p>

						<div
							className="animate-fade-up mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start"
							style={{ animationDelay: "240ms" }}
						>
							<Link
								href="/dashboard"
								className="group inline-flex w-full items-center justify-center rounded-lg bg-blue_munsell-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue_munsell-500/20 transition-all hover:bg-blue_munsell-600 hover:shadow-blue_munsell-500/30 sm:w-auto"
							>
								Start Managing Projects
								<ArrowRight
									className="ml-2 transition-transform group-hover:translate-x-0.5"
									size={18}
								/>
							</Link>
							<Link
								href="/projects"
								className="inline-flex w-full items-center justify-center rounded-lg border-2 border-french_gray-300 px-6 py-3.5 text-base font-semibold text-outer_space-500 transition-colors hover:border-blue_munsell-500 hover:text-blue_munsell-500 dark:border-paynes_gray-400 dark:text-platinum-500 dark:hover:border-blue_munsell-400 dark:hover:text-blue_munsell-300 sm:w-auto"
							>
								View Projects
							</Link>
						</div>
					</div>

					<div
						className="animate-fade-up relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none"
						style={{ animationDelay: "200ms" }}
					>
						<div className="rotate-1 rounded-2xl border border-french_gray-300 bg-white p-4 shadow-2xl shadow-outer_space-500/10 transition-transform hover:rotate-0 dark:border-paynes_gray-400 dark:bg-outer_space-400 dark:shadow-black/30">
							<div className="grid grid-cols-3 gap-3">
								<div className="space-y-2">
									<div className="flex items-center gap-1.5 px-1">
										<span className="h-2 w-2 rounded-full bg-french_gray-400" />
										<span className="text-[11px] font-semibold uppercase tracking-wide text-paynes_gray-400 dark:text-french_gray-400">
											To Do
										</span>
									</div>
									<div className="h-14 rounded-lg border border-french_gray-200 bg-platinum-100 p-2 dark:border-paynes_gray-400/60 dark:bg-outer_space-500">
										<div className="h-2 w-3/4 rounded bg-french_gray-400/70" />
										<div className="mt-2 h-2 w-1/2 rounded bg-french_gray-400/50" />
									</div>
									<div className="h-10 rounded-lg border border-french_gray-200 bg-platinum-100 p-2 dark:border-paynes_gray-400/60 dark:bg-outer_space-500">
										<div className="h-2 w-2/3 rounded bg-french_gray-400/70" />
									</div>
								</div>

								<div className="space-y-2">
									<div className="flex items-center gap-1.5 px-1">
										<span className="h-2 w-2 rounded-full bg-blue_munsell-500" />
										<span className="text-[11px] font-semibold uppercase tracking-wide text-paynes_gray-400 dark:text-french_gray-400">
											In Progress
										</span>
									</div>
									<div className="animate-float relative h-16 rounded-lg border-2 border-blue_munsell-400 bg-white p-2 shadow-lg ring-2 ring-blue_munsell-200 dark:bg-outer_space-500 dark:ring-blue_munsell-500/30">
										<div className="h-2 w-2/3 rounded bg-blue_munsell-400/70" />
										<div className="mt-2 h-2 w-1/3 rounded bg-blue_munsell-400/40" />
										<div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue_munsell-500 text-white shadow-md">
											<MoveRight size={12} strokeWidth={3} />
										</div>
									</div>
								</div>

								<div className="space-y-2">
									<div className="flex items-center gap-1.5 px-1">
										<span className="h-2 w-2 rounded-full bg-emerald-500" />
										<span className="text-[11px] font-semibold uppercase tracking-wide text-paynes_gray-400 dark:text-french_gray-400">
											Done
										</span>
									</div>
									<div className="h-12 rounded-lg border border-french_gray-200 bg-platinum-100 p-2 opacity-70 dark:border-paynes_gray-400/60 dark:bg-outer_space-500">
										<div className="h-2 w-2/3 rounded bg-emerald-400/60" />
									</div>
								</div>
							</div>
						</div>

						<div className="animate-float absolute -bottom-5 -left-5 hidden items-center gap-2 rounded-xl border border-french_gray-300 bg-white px-3 py-2 shadow-lg dark:border-paynes_gray-400 dark:bg-outer_space-400 sm:flex">
							<div className="flex -space-x-2">
								<span className="h-6 w-6 rounded-full border-2 border-white bg-blue_munsell-300 dark:border-outer_space-400" />
								<span className="h-6 w-6 rounded-full border-2 border-white bg-paynes_gray-300 dark:border-outer_space-400" />
								<span className="h-6 w-6 rounded-full border-2 border-white bg-blue_munsell-500 dark:border-outer_space-400" />
							</div>
							<span className="text-xs font-medium text-outer_space-500 dark:text-platinum-500">
								3 online
							</span>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
