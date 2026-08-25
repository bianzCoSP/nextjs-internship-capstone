import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
	return (
		<div className="h-full flex flex-col items-center justify-center space-y-6">
			<div className="flex w-full max-w-3xl overflow-hidden rounded-xl border shadow-sm">
				{/* Sidebar nav */}
				<div className="hidden w-56 shrink-0 flex-col gap-2 border-r bg-muted/30 p-4 sm:flex">
					<Skeleton className="mb-4 h-4 w-24" />
					{Array.from({ length: 4 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: loading ui
						<Skeleton key={i} className="h-8 w-full rounded-md" />
					))}
				</div>

				{/* Main content */}
				<div className="flex-1 space-y-8 p-6">
					{/* Header */}
					<div className="flex items-center gap-4">
						<Skeleton className="h-16 w-16 rounded-full" />
						<div className="space-y-2">
							<Skeleton className="h-4 w-40" />
							<Skeleton className="h-3 w-24" />
						</div>
					</div>

					{/* Section: Profile */}
					<div className="space-y-3">
						<Skeleton className="h-4 w-32" />
						<div className="flex items-center justify-between rounded-md border p-3">
							<Skeleton className="h-4 w-48" />
							<Skeleton className="h-8 w-16 rounded-md" />
						</div>
					</div>

					{/* Section: Email addresses */}
					<div className="space-y-3">
						<Skeleton className="h-4 w-40" />
						<div className="space-y-2">
							{Array.from({ length: 2 }).map((_, i) => (
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: loading ui
									key={i}
									className="flex items-center justify-between rounded-md border p-3"
								>
									<Skeleton className="h-4 w-56" />
									<Skeleton className="h-8 w-16 rounded-md" />
								</div>
							))}
						</div>
					</div>

					{/* Section: Connected accounts */}
					<div className="space-y-3">
						<Skeleton className="h-4 w-44" />
						<div className="flex items-center justify-between rounded-md border p-3">
							<Skeleton className="h-4 w-36" />
							<Skeleton className="h-8 w-20 rounded-md" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
