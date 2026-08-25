import { Skeleton } from "@/components/ui/skeleton";

export default function CalendarLoading() {
	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div className="space-y-2">
					<Skeleton className="h-9 w-40" />
					<Skeleton className="h-5 w-72" />
				</div>
				<Skeleton className="h-10 w-32 rounded-lg" />
			</div>

			<div className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6">
				{/* Legend */}
				<div className="flex items-center gap-4 mb-4">
					{Array.from({ length: 4 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: loading ui
						<div key={i} className="inline-flex items-center gap-1.5">
							<Skeleton className="h-2.5 w-2.5 rounded-full" />
							<Skeleton className="h-3 w-16" />
						</div>
					))}
				</div>

				{/* Calendar toolbar */}
				<div className="flex items-center justify-between mb-4">
					<div className="flex gap-2">
						<Skeleton className="h-8 w-16 rounded-md" />
						<Skeleton className="h-8 w-16 rounded-md" />
						<Skeleton className="h-8 w-16 rounded-md" />
					</div>
					<Skeleton className="h-6 w-40" />
					<div className="flex gap-2">
						<Skeleton className="h-8 w-20 rounded-md" />
						<Skeleton className="h-8 w-16 rounded-md" />
						<Skeleton className="h-8 w-16 rounded-md" />
						<Skeleton className="h-8 w-16 rounded-md" />
					</div>
				</div>

				{/* Calendar grid */}
				<div className="h-162.5 grid grid-rows-6 gap-1">
					{Array.from({ length: 6 }).map((_, row) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: loading ui
						<div key={row} className="grid grid-cols-7 gap-1">
							{Array.from({ length: 7 }).map((_, col) => (
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: loading ui
									key={col}
									className="border border-french_gray-200 dark:border-paynes_gray-500 rounded-md p-2 space-y-1"
								>
									<Skeleton className="h-3 w-5 ml-auto" />
									<Skeleton className="h-4 w-full rounded" />
									<Skeleton className="h-4 w-3/4 rounded" />
								</div>
							))}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
