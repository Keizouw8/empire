import { error } from "@sveltejs/kit";
import { type Handle } from "@sveltejs/kit/hooks";

import getDB from "#lib/db/db.ts";

export const handle: Handle = async ({ event, resolve }) => {
	let { params: { id }, locals: { user } } = event;

	const db = getDB();
	const room = await db.query.rooms.findFirst({
		where: { id },
		with: { members: true }
	});
	
	if (!room) throw error(404, "Room not found");
	if (!room.members.some((m) => m.id == user.id)) throw error(401, "User has no access to room");
	
	event.locals.room = room;
	return resolve(event);
};