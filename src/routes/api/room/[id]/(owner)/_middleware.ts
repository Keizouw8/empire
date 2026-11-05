import { error } from "@sveltejs/kit";
import { type Handle } from "@sveltejs/kit/hooks";

export const handle: Handle = async ({ event, resolve }) => {
	if (event.locals.room.ownerId != event.locals.user.id) throw error(403, "user isn't room owner");
	return resolve(event);
};