export type ProjectStatus = "To Do" | "In Progress" | "Review" | "Done";

export const STATUS_STYLES: Record<ProjectStatus, string> = {
	"In Progress":
		"bg-blue_munsell-100 text-blue_munsell-700 dark:bg-blue_munsell-900 dark:text-blue_munsell-300",
	Review:
		"bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
	"To Do": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
	Done: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

interface StatusBadgeProps {
	status: ProjectStatus;
	className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
	return (
		<span
			className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${STATUS_STYLES[status]} ${className}`}
		>
			{status}
		</span>
	);
}
