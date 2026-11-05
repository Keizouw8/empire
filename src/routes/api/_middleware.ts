import { error } from "@sveltejs/kit";
import { type Handle } from "@sveltejs/kit/hooks";
import { auth } from "#lib/auth.ts";

export const handle: Handle = async ({ event, resolve }) => {
	let session = await auth.api.getSession({ headers: event.request.headers });
	if (!session) throw error(401, "unauthorized session");
	event.locals.session = session.session;
	event.locals.user = session.user;
	return resolve(event);
};