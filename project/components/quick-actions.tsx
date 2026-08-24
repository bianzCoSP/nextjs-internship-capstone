"use client";

import { Plus, UserPlus } from "lucide-react";
import Link from "next/link";
import { CreateProjectButton } from "@/components/create-project-button";

const ACTION_LINK_CLASSNAME =
	"w-full flex items-center justify-center px-4 py-3 border border-french_gray-300 dark:border-paynes_gray-400 text-outer_space-500 dark:text-platinum-500 rounded-lg hover:bg-platinum-500 dark:hover:bg-paynes_gray-400 transition-colors";

export function QuickActions() {
	return (
		<div className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6">
			<h3 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500 mb-4">
				Quick Actions
			</h3>

			<div className="space-y-3">
				<CreateProjectButton className="w-full flex items-center justify-center px-4 py-3 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 transition-colors" />

				<Link href="/team" className={ACTION_LINK_CLASSNAME}>
					<UserPlus size={20} className="mr-2" />
					Add Team Member
				</Link>

				<Link href="/projects" className={ACTION_LINK_CLASSNAME}>
					<Plus size={20} className="mr-2" />
					Create Task
				</Link>
			</div>
		</div>
	);
}
