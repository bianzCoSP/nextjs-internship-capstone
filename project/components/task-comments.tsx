"use client";

import { useActionState, useEffect, useRef } from "react";
import {
	type AddCommentState,
	addComment,
} from "@/lib/actions/comment-actions";

export interface TaskCommentItem {
	id: string;
	content: string;
	createdAt: Date | string;
	authorId: string;
	authorName: string;
}

interface TaskCommentsProps {
	taskId: string;
	taskSlug: string | null;
	comments: TaskCommentItem[];
}

function getInitials(name: string) {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

function formatTimestamp(value: Date | string) {
	return new Date(value).toLocaleString(undefined, {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

const initialState: AddCommentState = { success: false };

export function TaskComments({
	taskId,
	taskSlug,
	comments,
}: TaskCommentsProps) {
	const formRef = useRef<HTMLFormElement>(null);
	const boundAddComment = addComment.bind(null, taskId, taskSlug ?? "");
	const [state, formAction, isPending] = useActionState(
		boundAddComment,
		initialState,
	);

	useEffect(() => {
		if (state.success) {
			formRef.current?.reset();
		}
	}, [state]);

	return (
		<div className="bg-white dark:bg-outer_space-300 rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 p-5">
			<h3 className="text-sm font-semibold text-outer_space-500 dark:text-platinum-500 mb-4">
				Comments{" "}
				<span className="text-paynes_gray-500 dark:text-french_gray-400 font-normal">
					({comments.length})
				</span>
			</h3>

			<div className="space-y-4 mb-5">
				{comments.length === 0 ? (
					<p className="text-sm text-paynes_gray-500 dark:text-french_gray-400">
						No comments yet. Be the first to comment.
					</p>
				) : (
					comments.map((comment) => (
						<div key={comment.id} className="flex gap-3">
							<div
								title={comment.authorName}
								className="w-7 h-7 shrink-0 bg-blue_munsell-500 rounded-full flex items-center justify-center text-white text-xs font-semibold"
							>
								{getInitials(comment.authorName)}
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium text-outer_space-500 dark:text-platinum-500">
										{comment.authorName}
									</span>
									<span className="text-xs text-paynes_gray-500 dark:text-french_gray-400">
										{formatTimestamp(comment.createdAt)}
									</span>
								</div>
								<p className="text-sm text-paynes_gray-600 dark:text-french_gray-300 whitespace-pre-wrap wrap-break-word">
									{comment.content}
								</p>
							</div>
						</div>
					))
				)}
			</div>

			<form ref={formRef} action={formAction} className="space-y-2">
				<textarea
					name="content"
					rows={3}
					required
					maxLength={2000}
					placeholder="Write a comment..."
					className="w-full rounded-lg border border-french_gray-300 dark:border-paynes_gray-400 bg-transparent p-3 text-sm text-outer_space-500 dark:text-platinum-500 focus:outline-none focus:ring-2 focus:ring-blue_munsell-500"
				/>
				{state.error ? (
					<p className="text-xs text-red-600 dark:text-red-400">
						{state.error}
					</p>
				) : null}
				<div className="flex justify-end">
					<button
						type="submit"
						disabled={isPending}
						className="px-4 py-2 text-sm font-medium text-white bg-blue_munsell-500 rounded-lg hover:bg-blue_munsell-600 transition-colors disabled:opacity-50"
					>
						{isPending ? "Posting..." : "Post Comment"}
					</button>
				</div>
			</form>
		</div>
	);
}
