import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getDB, roomMembers } from "@empire/web-db";
import { and, eq } from "drizzle-orm";
import { getGameRoom } from "#lib/gameRoom.ts";

export const POST: RequestHandler = async function ({ locals: { room }, request }) {
	let body: { email: string } = await request.json();
	if (!body.email) throw error(400, "body.email undefined");

	if (room.members.filter(m => m.id == room.ownerId)[0].email == body.email) throw error(400, "can't remove owner");
	let [user] = room.members.filter(m => m.email == body.email);
	if (!user) throw error(400, "no user with email in room");

	await getDB().delete(roomMembers).where(and(eq(roomMembers.userId, user.id), eq(roomMembers.roomId, room.id)));
	await getGameRoom(room.id).refreshRoom();
	
	return Response.json({ success: true, email: user.email, username: user.name });
}