import type { RequestHandler } from "./$types";
import { getGameRoom } from "#lib/gameRoom.ts";

export const GET: RequestHandler = async ({ request, locals: { user, room } }) => {
	if (request.headers.get("Upgrade") !== "websocket") return new Response("Expected upgrade to websocket", { status: 426 });	
	let headers = new Headers(request.headers);
	headers.set("x-user-id", user.id);
	return getGameRoom(room.id).fetch(new Request(request, { headers }));
};
