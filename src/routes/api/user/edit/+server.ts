import { env } from "cloudflare:workers";
import type { RequestHandler } from "./$types";
import { error } from "@sveltejs/kit";
import getDB from "#lib/db/db.ts";
import { users } from "#lib/db/schema.ts";
import { eq } from "drizzle-orm";

export const POST: RequestHandler = async function ({ locals: { user }, request }) {
	if (!env.r2) throw error(500, "r2 binding not found");
	
	let formData = await request.formData();
	let name = (formData.get("name") || undefined) as string | undefined;
	let pfp = formData.get("pfp");
	
	let image = undefined;
	let sentImage = user.image;
	if (pfp instanceof File && pfp.size > 0) {
		let buffer = await pfp.arrayBuffer();
		let res = await env.r2.put(`pfp/${user.id}`, buffer, { httpMetadata: { contentType: pfp.type } }).catch((err) => {
			console.error("Failed to upload to R2:", err);
			return null;
		});
		if (!res) throw error(500, "failed to upload image");
		image = `/bucket/pfp/${user.id}`;
		sentImage =  `${image}?v=${Date.now()}`;
	}
	
	let db = getDB();
	let data = await db.update(users).set({ name, image, updatedAt: new Date() }).where(eq(users.id, user.id)).returning();
	return Response.json({ ...data[0], image: sentImage });
}