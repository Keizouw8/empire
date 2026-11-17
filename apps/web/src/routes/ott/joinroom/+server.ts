import { error, redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getDB, roomMembers } from "@empire/web-db";
import { getGameRoom } from "#lib/gameRoom.ts";

export const GET: RequestHandler = async function ({ locals: { tokenData } }) {
	let { userId, roomId } = tokenData;
	if (!userId || !roomId) throw error(500, "userid or roomid doesn't exist");
	await getDB().insert(roomMembers).values({ userId, roomId }).onConflictDoNothing();
	await getGameRoom(roomId).refreshRoom();
	redirect(303, `/room/${roomId}`);
}