import { Skeleton } from "@/components/ui/skeleton";

const COLUMN_COUNT = 4;
const CARD_COUNTS = [3, 4, 2, 3];

export default function ProjectLoading() {
	return (
		<div className="flex h-full flex-col">
			{/* Project Header */}
			<div className="shrink-0 flex items-center justify-between pb-6">
				<div className="flex items-center space-x-4">
					<Skeleton className="h-9 w-9 rounded-lg" />
					<div className="space-y-2">
						<div className="flex items-center gap-3">
							<Skeleton className="h-9 w-56" />
							<Skeleton className="h-6 w-20 rounded-full" />
						</div>
						<Skeleton className="h-5 w-72" />
					</div>
				</div>

				<Skeleton className="h-9 w-9 rounded-lg" />
			</div>

			{/* Kanban Board */}
			<div className="flex-1 min-h-0">
				<div className="h-full min-h-125 flex space-x-4 md:space-x-6 overflow-x-auto pb-4">
					{Array.from({ length: COLUMN_COUNT }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: loading ui
						<KanbanColumnSkeleton key={i} cardCount={CARD_COUNTS[i] ?? 3} />
					))}
				</div>
			</div>
		</div>
	);
}

function KanbanColumnSkeleton({ cardCount }: { cardCount: number }) {
	return (
		<div className="shrink-0 w-[85vw] sm:w-80 lg:flex-1 lg:min-w-75 h-full">
			<div className="flex flex-col h-full max-h-full rounded-xl bg-platinum-100/60 dark:bg-outer_space-400/40 border border-french_gray-300/60 dark:border-paynes_gray-400/40">
				<div className="shrink-0 px-4 py-3 border-b border-french_gray-300/60 dark:border-paynes_gray-400/40">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Skeleton className="h-5 w-20" />
							<Skeleton className="h-5 w-6 rounded-full" />
						</div>
					</div>
				</div>

				<div className="p-3 space-y-3 flex-1 overflow-y-auto">
					{Array.from({ length: cardCount }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: loading ui
						<TaskCardSkeleton key={i} />
					))}
					<Skeleton className="h-9 w-full rounded-lg" />
				</div>
			</div>
		</div>
	);
}

function TaskCardSkeleton() {
	return (
		<div className="relative w-full bg-white dark:bg-outer_space-300 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-4">
			<Skeleton className="h-4 w-3/4 mb-2" />
			<Skeleton className="h-3 w-full mb-1.5" />
			<Skeleton className="h-3 w-2/3 mb-3" />

			<div className="flex items-center justify-between mt-2">
				<div className="flex items-center gap-2">
					<Skeleton className="h-5 w-12 rounded-full" />
					<Skeleton className="h-3 w-10" />
				</div>
				<Skeleton className="h-6 w-6 rounded-full" />
			</div>
		</div>
	);
}
