import { Skeleton } from "@/components/ui/skeleton";

export default function TeamLoading() {
	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div className="space-y-2">
					<Skeleton className="h-9 w-32" />
					<Skeleton className="h-5 w-64" />
				</div>
				<Skeleton className="h-10 w-36 rounded-lg" />
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{Array.from({ length: 6 }).map((_, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: loading ui
					<TeamMemberCardSkeleton key={index} />
				))}
			</div>
		</div>
	);
}

function TeamMemberCardSkeleton() {
	return (
		<div className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6">
			<div className="flex items-start justify-between mb-4">
				<div className="flex items-center space-x-3">
					<Skeleton className="w-12 h-12 rounded-full" />
					<div className="space-y-2">
						<Skeleton className="h-4 w-28" />
						<Skeleton className="h-3 w-16" />
					</div>
				</div>
				<Skeleton className="h-6 w-6 rounded" />
			</div>

			<div className="flex items-center mb-4">
				<Skeleton className="h-4 w-40" />
			</div>

			<div className="flex items-center justify-between">
				<Skeleton className="h-5 w-16 rounded-full" />
				<Skeleton className="h-4 w-24" />
			</div>
		</div>
	);
}
