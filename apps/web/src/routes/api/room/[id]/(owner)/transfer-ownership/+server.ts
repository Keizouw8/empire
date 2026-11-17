import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getDB, rooms } from "@empire/web-db";
import { eq } from "drizzle-orm";
import { getGameRoom } from "#lib/gameRoom.ts";

export const POST: RequestHandler = async function ({ locals: { room }, request }) {
	let body: { email: string } = await request.json();
	if (!body.email) throw error(400, "body.email undefined");

	let [newOwner] = room.members.filter(m => m.email == body.email)
	if (!newOwner) throw error(400, "no user with email in room");
	
	await getDB().update(rooms).set({ ownerId: newOwner.id }).where(eq(rooms.id, room.id));
	await getGameRoom(room.id).refreshRoom();
	
	return Response.json({ success: true, email: newOwner.email, username: newOwner.name });
}