import { Skeleton } from "@/components/ui/skeleton";

export default function TaskDetailLoading() {
	return (
		<div className="flex h-full flex-col max-w-3xl mx-auto w-full">
			<div className="shrink-0 flex items-center space-x-4 pb-6">
				<Skeleton className="h-9 w-9 rounded-lg" />
				<div className="space-y-2">
					<Skeleton className="h-3 w-40" />
					<Skeleton className="h-7 w-64" />
				</div>
			</div>

			<div className="flex-1 min-h-0 overflow-y-auto space-y-6 pb-10">
				<div className="bg-white dark:bg-outer_space-300 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-5 space-y-5">
					<div className="flex flex-wrap items-center gap-2">
						<Skeleton className="h-6 w-24 rounded-full" />
						<Skeleton className="h-6 w-20 rounded-full" />
						<Skeleton className="h-4 w-28" />
					</div>

					<div>
						<Skeleton className="h-3 w-24 mb-3" />
						<div className="space-y-2">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-2/3" />
						</div>
					</div>

					<div>
						<Skeleton className="h-3 w-20 mb-3" />
						<div className="flex flex-wrap gap-3">
							<div className="flex items-center gap-2">
								<Skeleton className="h-6 w-6 rounded-full" />
								<Skeleton className="h-4 w-20" />
							</div>
							<div className="flex items-center gap-2">
								<Skeleton className="h-6 w-6 rounded-full" />
								<Skeleton className="h-4 w-24" />
							</div>
						</div>
					</div>

					<div className="pt-1 border-t border-french_gray-300/60 dark:border-paynes_gray-400/40">
						<Skeleton className="h-3 w-48" />
					</div>
				</div>

				<div className="bg-white dark:bg-outer_space-300 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-5">
					<Skeleton className="h-4 w-32 mb-4" />

					<div className="space-y-4 mb-5">
						{Array.from({ length: 3 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: loading ui
							<div key={i} className="flex gap-3">
								<Skeleton className="h-7 w-7 shrink-0 rounded-full" />
								<div className="flex-1 min-w-0 space-y-2">
									<div className="flex items-center gap-2">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-3 w-16" />
									</div>
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-3/4" />
								</div>
							</div>
						))}
					</div>

					<div className="space-y-2">
						<Skeleton className="h-20 w-full rounded-lg" />
						<div className="flex justify-end">
							<Skeleton className="h-9 w-28 rounded-lg" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
