import type { LayoutServerLoad } from "./$types";
import getDB from "#lib/db/db.ts";
import { error } from "@sveltejs/kit";

export const load: LayoutServerLoad = async ({ locals: { user, session }, params: { id } }) => {
	let db = getDB();
	const room = await db.query.rooms.findFirst({
		where: { id },
		with: { members: true }
	});
	if (!room) throw error(404, "no room");
	if (!room.members.map(u => u.id).includes(user.id)) throw error(401, "user has no access to room");
	return { session, user, room };
}