import type { RequestHandler } from "./$types";
import getDB from "#lib/db/db.ts";
import { error } from "@sveltejs/kit";
import { rooms, roomMembers } from "#lib/db/schema.ts";

export const POST: RequestHandler = async function ({ request, locals: { user } }) {
	let db = getDB();
	let body: { name: string } = await request.json();
	if (!body.name) throw error(400, "body.name undefined");
	let [{ id }] = await db.insert(rooms).values({ name: body.name, ownerId: user.id }).returning({ id: rooms.id });
	await db.insert(roomMembers).values({ userId: user.id, roomId: id });
	return Response.json({ success: true, id });
}