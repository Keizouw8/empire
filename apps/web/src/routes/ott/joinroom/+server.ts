import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getDB, roomMembers } from "@empire/database";
import { getGameRoom } from "#lib/gameRoom.ts";

export const GET: RequestHandler = async function ({ locals: { tokenData } }) {
	let { userId, roomId } = tokenData;
	if (!userId || !roomId) throw error(500, "userid or roomid doesn't exist");
	await getDB().insert(roomMembers).values({ userId, roomId });
	await getGameRoom(roomId).refreshRoom();
	return Response.json({ success: true });
}