import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async function({ locals: { room } }) {
	return Response.json({ room });
}