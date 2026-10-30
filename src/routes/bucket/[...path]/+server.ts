import { env } from "cloudflare:workers";
import { error } from "@sveltejs/kit";

export async function GET({ params: { path } }) {
	if (!env.r2) throw error(500, "r2 binding not found");
	let object = await env.r2.get(path);
	if (!object) throw error(404, "object not found");
	let headers = new Headers();
	object.writeHttpMetadata(headers);
	headers.set("etag", object.httpEtag);
	return new Response(object.body, { headers });
}
