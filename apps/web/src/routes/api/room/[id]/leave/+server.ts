import type { RequestHandler } from "./$types";
import { getDB, roomMembers } from "@empire/database";
import { and, eq } from "drizzle-orm";
import { getGameRoom } from "#lib/gameRoom.ts";
import { error } from "@sveltejs/kit";

export const POST: RequestHandler = async function ({ locals: { room, user } }) {
	if (user.id == room.ownerId) throw error(400, "user is room owner");
	await getDB().delete(roomMembers).where(and(eq(roomMembers.userId, user.id), eq(roomMembers.roomId, room.id)));
	await getGameRoom(room.id).refreshRoom();
	return Response.json({ success: true });
}