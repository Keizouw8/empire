import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals: { user, session, room } }) => {
	return { session, user, room };
}