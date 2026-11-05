import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async function ({ locals: { user, room }, request }) {
	return new Response();
}