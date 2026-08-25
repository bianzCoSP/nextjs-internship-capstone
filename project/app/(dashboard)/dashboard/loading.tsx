import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
	return (
		<div className="space-y-6">
			<div>
				<Skeleton className="h-9 w-48" />
				<Skeleton className="h-5 w-96 mt-2" />
			</div>

			<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: loading ui
						key={i}
						className="bg-white dark:bg-outer_space-500 overflow-hidden rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6"
					>
						<div className="flex items-center">
							<Skeleton className="h-8 w-8 rounded-lg shrink-0" />
							<div className="ml-5 w-0 flex-1 space-y-2">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-7 w-12" />
							</div>
						</div>
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Recent Projects skeleton */}
				<div className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6">
					<div className="flex items-center justify-between mb-6">
						<Skeleton className="h-6 w-36" />
						<Skeleton className="h-5 w-14" />
					</div>

					<div className="space-y-4">
						{Array.from({ length: 3 }).map((_, i) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: loading ui
								key={i}
								className="border border-french_gray-300 dark:border-paynes_gray-400 rounded-lg p-4"
							>
								<Skeleton className="h-5 w-3/5" />
								<Skeleton className="h-4 w-4/5 mt-2" />

								<div className="flex items-center space-x-4 mt-3">
									<Skeleton className="h-4 w-10" />
									<Skeleton className="h-4 w-20" />
								</div>

								<div className="mt-3">
									<div className="flex items-center justify-between mb-1">
										<Skeleton className="h-4 w-16" />
										<Skeleton className="h-4 w-8" />
									</div>
									<Skeleton className="h-2 w-full rounded-full" />
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Quick Actions skeleton */}
				<div className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6">
					<Skeleton className="h-6 w-32 mb-4" />

					<div className="space-y-3">
						<Skeleton className="h-11 w-full rounded-lg" />
						<Skeleton className="h-11 w-full rounded-lg" />
						<Skeleton className="h-11 w-full rounded-lg" />
					</div>
				</div>
			</div>
		</div>
	);
}
