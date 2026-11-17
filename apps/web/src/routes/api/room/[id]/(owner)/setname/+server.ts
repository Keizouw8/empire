import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getDB, rooms } from "@empire/database";
import { eq } from "drizzle-orm";
import { getGameRoom } from "#lib/gameRoom.ts";

export const POST: RequestHandler = async function ({ locals: { room }, request }) {
	let body: { name: string } = await request.json();
	if (!body.name) throw error(400, "body.name undefined");

	let db = getDB();
	await db.update(rooms).set({ name: body.name.replaceAll(/[\u0000-\u001F\u007F-\u009F]/g, "") }).where(eq(rooms.id, room.id));
	await getGameRoom(room.id).refreshRoom();
	
	return Response.json({ success: true });
}