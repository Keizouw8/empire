import getDB from "#lib/db/db.ts";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) return { session: locals.session, user: null };

	const db = getDB(platform?.env?.db);
	const user = await db.query.user.findFirst({
		where: { id: locals.user.id },
		with: { rooms: true }
	});

	return { session: locals.session, user: user ?? locals.user };
};