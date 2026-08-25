import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-platinum-900 dark:bg-outer_space-600 px-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-8 flex flex-col items-center">
					<Skeleton className="h-9 w-56 mb-3" />
					<Skeleton className="h-5 w-72" />
				</div>
				<div className="flex justify-center">
					<div className="w-full max-w-sm rounded-xl border border-french_gray-300/40 dark:border-paynes_gray-500/40 p-6 space-y-6">
						<div className="flex flex-col items-center space-y-2">
							<Skeleton className="h-10 w-10 rounded-full" />
							<Skeleton className="h-4 w-40" />
						</div>

						<div className="space-y-3">
							<Skeleton className="h-10 w-full rounded-md" />
							<Skeleton className="h-10 w-full rounded-md" />
						</div>

						<div className="flex items-center gap-3">
							<Skeleton className="h-px flex-1" />
							<Skeleton className="h-3 w-8" />
							<Skeleton className="h-px flex-1" />
						</div>

						<div className="space-y-3">
							<Skeleton className="h-4 w-16" />
							<Skeleton className="h-10 w-full rounded-md" />
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-10 w-full rounded-md" />
						</div>

						<Skeleton className="h-10 w-full rounded-md" />

						<div className="flex justify-center">
							<Skeleton className="h-4 w-48" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
