import type { RequestHandler } from "./$types";
import { getDB, rooms } from "@empire/database";
import { eq } from "drizzle-orm";
import { getGameRoom } from "#lib/gameRoom.ts";

export const POST: RequestHandler = async function ({ locals: { room } }) {
	await getDB().delete(rooms).where(eq(rooms.id, room.id));
	await getGameRoom(room.id).refreshRoom();
	return Response.json({ success: true });
}