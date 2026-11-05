import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import getDB from "#lib/db/db.ts";
import { roomMembers } from "#lib/db/schema.ts";

export const POST: RequestHandler = async function ({ locals: { room }, request }) {
	let body: { email: string } = await request.json();
	if (!body.email) throw error(400, "body.email undefined");

	let db = getDB();
	let user = await db.query.user.findFirst({ where: { email: body.email } });
	if (!user) throw error(400, "no user with email");
	await db.insert(roomMembers).values({ userId: user.id, roomId: room.id });
	
	return Response.json({ success: true, username: user.name, email: user.email });
}