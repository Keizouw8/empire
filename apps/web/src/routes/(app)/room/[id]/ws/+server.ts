import { error } from "@sveltejs/kit";
import { env } from "cloudflare:workers";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ request, locals: { user, room } }) => {
	if (!env?.DO) throw error(500, "DO binding not found");
	if (request.headers.get("Upgrade") !== "websocket") return new Response("Expected upgrade to websocket", { status: 426 });
	let stub = env.DO.get(env.DO.idFromName(room.id));
	let headers = new Headers(request.headers);
	headers.set("x-user-id", user.id);
	return stub.fetch(new Request(request, { headers }));
};
