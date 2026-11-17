import { getDB } from "@empire/web-db";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) error(401, "Unauthorized");

	const user = await getDB().query.users.findFirst({
		where: { id: locals.user.id },
		with: { rooms: true }
	});

	if (!user) error(401, "User not found");

	return { session: locals.session, user };
};