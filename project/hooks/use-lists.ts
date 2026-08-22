import { useQuery } from "@tanstack/react-query";
import { queries } from "@/lib/db/index";

export function useLists(projectId: string) {
	const {
		data: lists,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["lists", projectId],
		queryFn: () => queries.lists.getByProject(projectId),
		enabled: !!projectId,
	});

	return {
		lists,
		isLoading,
		error,
	};
}
