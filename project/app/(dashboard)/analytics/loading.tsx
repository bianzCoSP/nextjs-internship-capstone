import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
	return (
		<div className="space-y-6">
			<div>
				<Skeleton className="h-9 w-40" />
				<Skeleton className="h-5 w-80 mt-2" />
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{Array.from({ length: 4 }).map((_, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: loading ui
						key={i}
						className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6"
					>
						<div className="flex items-center justify-between mb-4">
							<Skeleton className="w-10 h-10 rounded-lg" />
						</div>
						<Skeleton className="h-8 w-16 mb-2" />
						<Skeleton className="h-4 w-24 mb-2" />
						<Skeleton className="h-3 w-28" />
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6">
					<Skeleton className="h-6 w-40 mb-4" />
					<Skeleton className="h-64 w-full rounded-md" />
				</div>

				<div className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6">
					<Skeleton className="h-6 w-32 mb-4" />
					<Skeleton className="h-64 w-full rounded-md" />
				</div>
			</div>
		</div>
	);
}
