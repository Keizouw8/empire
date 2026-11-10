import getDB from "#lib/db/db.ts";
import { verification } from "#lib/db/schema.ts";
import { error } from "@sveltejs/kit";
import { type Handle } from "@sveltejs/kit/hooks";
import { eq } from "drizzle-orm";

export const handle: Handle = async ({ event, resolve }) => {
	let token = event.url.searchParams.get("token");
	if (!token) throw error(400, "missing token");
	let identifier = `${event.route.id?.replace("/ott/", "")}-${token}`;
	let [item] = await getDB().delete(verification).where(eq(verification.identifier, identifier)).returning({ value: verification.value });
	if (!item) throw error(400, "invalid token");
	let { body } = JSON.parse(item.value);
	event.locals.tokenData = body;
	return resolve(event);
};