import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock, revalidatePathMock, queriesMock } = vi.hoisted(() => ({
	authMock: vi.fn(),
	revalidatePathMock: vi.fn(),
	queriesMock: {
		users: { getByClerkId: vi.fn() },
		projects: { isMember: vi.fn() },
		events: {
			create: vi.fn(),
			update: vi.fn(),
			getById: vi.fn(),
			delete: vi.fn(),
		},
	},
}));

vi.mock("@clerk/nextjs/server", () => ({ auth: authMock }));
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));
vi.mock("@/lib/db", () => ({ queries: queriesMock }));

import {
	createEvent,
	deleteEvent,
	updateEvent,
} from "@/lib/actions/event-actions";

function makeEventFormData(overrides: Record<string, string> = {}) {
	const fd = new FormData();
	fd.set("title", "Launch meeting");
	fd.set("startDate", "2026-09-01T10:00:00.000Z");
	fd.set("endDate", "2026-09-01T11:00:00.000Z");
	for (const [key, value] of Object.entries(overrides)) {
		fd.set(key, value);
	}
	return fd;
}

describe("createEvent", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("rejects when not signed in", async () => {
		authMock.mockResolvedValue({ userId: null });

		const result = await createEvent({ success: false }, makeEventFormData());

		expect(result).toEqual({
			success: false,
			errors: { _form: ["Not signed in"] },
		});
	});

	it("returns field errors when the schema fails to validate", async () => {
		authMock.mockResolvedValue({ userId: "clerk_1" });

		const result = await createEvent(
			{ success: false },
			makeEventFormData({ title: "" }),
		);

		expect(result.success).toBe(false);
		expect(result.errors).toBeDefined();
		expect(result.errors?.title).toBeTruthy();
	});

	it("rejects when the user record cannot be found", async () => {
		authMock.mockResolvedValue({ userId: "clerk_1" });
		queriesMock.users.getByClerkId.mockResolvedValue(null);

		const result = await createEvent({ success: false }, makeEventFormData());

		expect(result).toEqual({
			success: false,
			errors: { _form: ["User not found"] },
		});
	});

	it("rejects when a projectId is supplied but the user is not a member", async () => {
		authMock.mockResolvedValue({ userId: "clerk_1" });
		queriesMock.users.getByClerkId.mockResolvedValue({ id: "user-1" });
		queriesMock.projects.isMember.mockResolvedValue(false);

		const result = await createEvent(
			{ success: false },
			makeEventFormData({ projectId: "project-1" }),
		);

		expect(queriesMock.projects.isMember).toHaveBeenCalledWith(
			"project-1",
			"user-1",
		);
		expect(result).toEqual({
			success: false,
			errors: { _form: ["You're not a member of that project"] },
		});
		expect(queriesMock.events.create).not.toHaveBeenCalled();
	});

	it("creates the event and revalidates the calendar when valid", async () => {
		authMock.mockResolvedValue({ userId: "clerk_1" });
		queriesMock.users.getByClerkId.mockResolvedValue({ id: "user-1" });

		const result = await createEvent({ success: false }, makeEventFormData());

		expect(queriesMock.events.create).toHaveBeenCalledWith(
			expect.objectContaining({ title: "Launch meeting", creatorId: "user-1" }),
		);
		expect(revalidatePathMock).toHaveBeenCalledWith("/calendar");
		expect(result).toEqual({ success: true });
	});

	it("skips the membership check when no projectId is supplied", async () => {
		authMock.mockResolvedValue({ userId: "clerk_1" });
		queriesMock.users.getByClerkId.mockResolvedValue({ id: "user-1" });

		await createEvent({ success: false }, makeEventFormData());

		expect(queriesMock.projects.isMember).not.toHaveBeenCalled();
	});
});

describe("updateEvent", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("rejects when not signed in", async () => {
		authMock.mockResolvedValue({ userId: null });

		const result = await updateEvent(
			"event-1",
			{ success: false },
			makeEventFormData(),
		);

		expect(result).toEqual({
			success: false,
			errors: { _form: ["Not signed in"] },
		});
	});

	it("rejects when eventId is missing", async () => {
		authMock.mockResolvedValue({ userId: "clerk_1" });

		const result = await updateEvent(
			"",
			{ success: false },
			makeEventFormData(),
		);

		expect(result).toEqual({
			success: false,
			errors: { _form: ["Missing event"] },
		});
	});

	it("returns field errors on invalid data", async () => {
		authMock.mockResolvedValue({ userId: "clerk_1" });

		const result = await updateEvent(
			"event-1",
			{ success: false },
			makeEventFormData({ title: "" }),
		);

		expect(result.success).toBe(false);
		expect(result.errors?.title).toBeTruthy();
	});

	it("rejects when the event does not exist", async () => {
		authMock.mockResolvedValue({ userId: "clerk_1" });
		queriesMock.events.getById.mockResolvedValue(null);

		const result = await updateEvent(
			"event-1",
			{ success: false },
			makeEventFormData(),
		);

		expect(result).toEqual({
			success: false,
			errors: { _form: ["Event not found"] },
		});
	});

	it("returns a failure message when the update fails at the data layer", async () => {
		authMock.mockResolvedValue({ userId: "clerk_1" });
		queriesMock.events.getById.mockResolvedValue({ id: "event-1" });
		queriesMock.events.update.mockResolvedValue(null);

		const result = await updateEvent(
			"event-1",
			{ success: false },
			makeEventFormData(),
		);

		expect(result).toEqual({
			success: false,
			errors: { _form: ["Failed to update event"] },
		});
	});

	it("updates the event and revalidates the calendar when valid", async () => {
		authMock.mockResolvedValue({ userId: "clerk_1" });
		queriesMock.events.getById.mockResolvedValue({ id: "event-1" });
		queriesMock.events.update.mockResolvedValue({ id: "event-1" });

		const result = await updateEvent(
			"event-1",
			{ success: false },
			makeEventFormData(),
		);

		expect(revalidatePathMock).toHaveBeenCalledWith("/calendar");
		expect(result).toEqual({ success: true });
	});
});

describe("deleteEvent", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("rejects when not signed in", async () => {
		authMock.mockResolvedValue({ userId: null });

		const result = await deleteEvent("event-1");

		expect(result).toEqual({ success: false, error: "Not signed in" });
	});

	it("rejects when eventId is missing", async () => {
		authMock.mockResolvedValue({ userId: "clerk_1" });

		const result = await deleteEvent("");

		expect(result).toEqual({ success: false, error: "Missing event" });
	});

	it("rejects when the event does not exist", async () => {
		authMock.mockResolvedValue({ userId: "clerk_1" });
		queriesMock.events.getById.mockResolvedValue(null);

		const result = await deleteEvent("event-1");

		expect(result).toEqual({ success: false, error: "Event not found" });
	});

	it("returns a failure message when the delete call throws", async () => {
		authMock.mockResolvedValue({ userId: "clerk_1" });
		queriesMock.events.getById.mockResolvedValue({ id: "event-1" });
		queriesMock.events.delete.mockRejectedValue(new Error("db error"));

		const result = await deleteEvent("event-1");

		expect(result).toEqual({
			success: false,
			error: "Failed to delete event",
		});
	});

	it("deletes the event and revalidates the calendar", async () => {
		authMock.mockResolvedValue({ userId: "clerk_1" });
		queriesMock.events.getById.mockResolvedValue({ id: "event-1" });
		queriesMock.events.delete.mockResolvedValue(undefined);

		const result = await deleteEvent("event-1");

		expect(queriesMock.events.delete).toHaveBeenCalledWith("event-1");
		expect(revalidatePathMock).toHaveBeenCalledWith("/calendar");
		expect(result).toEqual({ success: true });
	});
});
