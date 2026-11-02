import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async function({ params: { id } }) {
	return Response.json({ id });
}