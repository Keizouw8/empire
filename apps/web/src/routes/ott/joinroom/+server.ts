import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getDB, roomMembers } from "@empire/database";

export const GET: RequestHandler = async function ({ locals: { tokenData } }) {
	let { userId, roomId } = tokenData;
	if (!userId || !roomId) throw error(500, "userid or roomid doesn't exist");
	await getDB().insert(roomMembers).values({ userId, roomId });
	return Response.json({ success: true });
}