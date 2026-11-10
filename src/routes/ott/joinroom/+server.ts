import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { roomMembers } from "#lib/db/schema.ts";
import getDB from "#lib/db/db.ts";

export const GET: RequestHandler = async function ({ locals: { tokenData } }) {
	let { userId, roomId } = tokenData;
	if (!userId || !roomId) throw error(500, "userid or roomid doesn't exist");
	await getDB().insert(roomMembers).values({ userId, roomId });
	return Response.json({ success: true });
}