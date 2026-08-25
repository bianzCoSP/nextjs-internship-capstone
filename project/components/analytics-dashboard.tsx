"use client";

import { BarChart3, Clock, TrendingUp, Users } from "lucide-react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { AnalyticsData } from "@/lib/db/index";

interface AnalyticsDashboardProps {
	analytics: AnalyticsData;
}

const ICON_STYLES: Record<
	string,
	{ icon: typeof TrendingUp; bg: string; text: string }
> = {
	velocity: {
		icon: TrendingUp,
		bg: "bg-blue-100 dark:bg-blue-900",
		text: "text-blue-500",
	},
	efficiency: {
		icon: BarChart3,
		bg: "bg-green-100 dark:bg-green-900",
		text: "text-green-500",
	},
	activeUsers: {
		icon: Users,
		bg: "bg-purple-100 dark:bg-purple-900",
		text: "text-purple-500",
	},
	avgTaskDays: {
		icon: Clock,
		bg: "bg-orange-100 dark:bg-orange-900",
		text: "text-orange-500",
	},
};

function formatDayLabel(dateStr: string) {
	const [year, month, day] = dateStr.split("-").map(Number);
	const date = new Date(year, month - 1, day);
	return date.toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
	});
}

export function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
	const metrics = [
		{
			key: "velocity",
			title: "Project Velocity",
			value: analytics.velocity.toString(),
			unit: "tasks/week",
		},
		{
			key: "efficiency",
			title: "Team Efficiency",
			value: `${analytics.efficiency}%`,
			unit: "completion rate",
		},
		{
			key: "activeUsers",
			title: "Active Users",
			value: analytics.activeUsers.toString(),
			unit: "on your projects",
		},
		{
			key: "avgTaskDays",
			title: "Avg. Task Time",
			value: analytics.avgTaskDays.toString(),
			unit: "days",
		},
	];

	const teamActivityData = analytics.teamActivity.map((d) => ({
		label: formatDayLabel(d.date),
		completed: d.completed,
	}));

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{metrics.map((metric) => {
					const style = ICON_STYLES[metric.key];
					const Icon = style.icon;
					return (
						<div
							key={metric.key}
							className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6"
						>
							<div className="flex items-center justify-between mb-4">
								<div
									className={`w-10 h-10 ${style.bg} rounded-lg flex items-center justify-center`}
								>
									<Icon className={style.text} size={20} />
								</div>
							</div>
							<div className="text-2xl font-bold text-outer_space-500 dark:text-platinum-500 mb-1">
								{metric.value}
							</div>
							<div className="text-sm text-paynes_gray-500 dark:text-french_gray-400 mb-2">
								{metric.unit}
							</div>
							<div className="text-xs font-medium text-outer_space-500 dark:text-platinum-500">
								{metric.title}
							</div>
						</div>
					);
				})}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6">
					<h3 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500 mb-4">
						Project Progress
					</h3>
					{analytics.projectProgress.length === 0 ? (
						<div className="h-64 flex items-center justify-center text-paynes_gray-500 dark:text-french_gray-400 text-sm">
							No projects yet
						</div>
					) : (
						<div className="h-64">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={analytics.projectProgress}
									layout="vertical"
									margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
								>
									<CartesianGrid
										strokeDasharray="3 3"
										horizontal={false}
										className="stroke-french_gray-300 dark:stroke-paynes_gray-400"
									/>
									<XAxis type="number" domain={[0, 100]} unit="%" />
									<YAxis
										type="category"
										dataKey="name"
										width={110}
										tick={{ fontSize: 12 }}
									/>
									<Tooltip
										contentStyle={{
											backgroundColor: "var(--tooltip-bg)",
											borderColor: "var(--tooltip-border)",
											color: "var(--tooltip-text)",
										}}
										labelStyle={{ color: "var(--tooltip-text)" }}
										itemStyle={{ color: "var(--tooltip-text)" }}
										formatter={(value) => [`${value}%`, "Progress"]}
									/>
									<Bar
										dataKey="progress"
										fill="#3b82f6"
										radius={[0, 4, 4, 0]}
										barSize={16}
									/>
								</BarChart>
							</ResponsiveContainer>
						</div>
					)}
				</div>

				<div className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-6">
					<h3 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500 mb-4">
						Team Activity
					</h3>
					{teamActivityData.length === 0 ? (
						<div className="h-64 flex items-center justify-center text-paynes_gray-500 dark:text-french_gray-400 text-sm">
							No completed tasks in the last 14 days
						</div>
					) : (
						<div className="h-64">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart
									data={teamActivityData}
									margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
								>
									<CartesianGrid
										strokeDasharray="3 3"
										className="stroke-french_gray-300 dark:stroke-paynes_gray-400"
									/>
									<XAxis dataKey="label" tick={{ fontSize: 12 }} />
									<YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
									<Tooltip
										contentStyle={{
											backgroundColor: "var(--tooltip-bg)",
											borderColor: "var(--tooltip-border)",
											color: "var(--tooltip-text)",
										}}
										labelStyle={{ color: "var(--tooltip-text)" }}
										itemStyle={{ color: "var(--tooltip-text)" }}
										formatter={(value) => [`${value}%`, "Progress"]}
									/>
									<Line
										type="monotone"
										dataKey="completed"
										stroke="#22c55e"
										strokeWidth={2}
										dot={false}
									/>
								</LineChart>
							</ResponsiveContainer>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
