import type { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { queries } from "@/lib/db";

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

export async function POST(req: Request) {
	if (!WEBHOOK_SECRET) {
		throw new Error("CLERK_WEBHOOK_SIGNING_SECRET is not set");
	}

	const headerPayload = await headers();
	const svix_id = headerPayload.get("svix-id");
	const svix_timestamp = headerPayload.get("svix-timestamp");
	const svix_signature = headerPayload.get("svix-signature");

	if (!svix_id || !svix_timestamp || !svix_signature) {
		return new Response("Missing svix headers", { status: 400 });
	}

	const payload = await req.text();
	const wh = new Webhook(WEBHOOK_SECRET);

	let evt: WebhookEvent;
	try {
		evt = wh.verify(payload, {
			"svix-id": svix_id,
			"svix-timestamp": svix_timestamp,
			"svix-signature": svix_signature,
		}) as WebhookEvent;
	} catch (err) {
		console.error("Webhook verification failed:", err);
		return new Response("Invalid signature", { status: 400 });
	}

	const eventType = evt.type;

	try {
		switch (eventType) {
			case "user.created": {
				const { id, email_addresses, first_name, last_name } = evt.data;
				const email = email_addresses[0]?.email_address;
				if (!email) {
					return new Response("No email on user", { status: 400 });
				}
				await queries.users.create({
					clerkId: id,
					email,
					name: [first_name, last_name].filter(Boolean).join(" ") || "Unnamed",
				});
				break;
			}

			case "user.updated": {
				const { id, email_addresses, first_name, last_name } = evt.data;
				const email = email_addresses[0]?.email_address;
				await queries.users.update(id, {
					...(email && { email }),
					name: [first_name, last_name].filter(Boolean).join(" ") || "Unnamed",
				});
				break;
			}

			case "user.deleted": {
				const { id } = evt.data;
				if (id) await queries.users.delete(id);
				break;
			}

			default:
				console.log(`Unhandled Clerk event: ${eventType}`);
		}
	} catch (err) {
		console.error(`Error handling ${eventType}:`, err);
		return new Response("Database error", { status: 500 });
	}

	return new Response("OK", { status: 200 });
}
