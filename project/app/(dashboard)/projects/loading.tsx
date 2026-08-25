import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsLoading() {
	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div className="space-y-2">
					<Skeleton className="h-9 w-40" />
					<Skeleton className="h-5 w-64" />
				</div>
				<Skeleton className="h-10 w-36 rounded-lg" />
			</div>

			{/* Search and Filter Bar */}
			<div className="flex flex-col sm:flex-row gap-4">
				<Skeleton className="h-10 flex-1 rounded-lg" />
				<Skeleton className="h-10 w-24 rounded-lg" />
			</div>

			{/* Project Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{Array.from({ length: 6 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: loading ui
					<ProjectCardSkeleton key={i} />
				))}
			</div>
		</div>
	);
}

function ProjectCardSkeleton() {
	return (
		<div className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6">
			<div className="flex items-start justify-between mb-4">
				<Skeleton className="w-3 h-3 rounded-full" />
				<Skeleton className="h-6 w-6 rounded-md" />
			</div>

			<Skeleton className="h-6 w-3/4 mb-2" />

			<div className="space-y-2 mb-4">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-2/3" />
			</div>

			<div className="flex items-center justify-between mb-4">
				<Skeleton className="h-4 w-20" />
				<Skeleton className="h-4 w-24" />
			</div>

			<div className="mb-4">
				<div className="flex items-center justify-between mb-2">
					<Skeleton className="h-4 w-16" />
					<Skeleton className="h-4 w-8" />
				</div>
				<Skeleton className="h-2 w-full rounded-full" />
			</div>

			<div className="flex items-center justify-between">
				<Skeleton className="h-6 w-20 rounded-full" />
			</div>
		</div>
	);
}
