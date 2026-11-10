import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import getDB from "#lib/db/db.ts";
import sendEmail from "#lib/email.ts";
import { createVerificationToken } from "#lib/verificationToken.ts";

export const POST: RequestHandler = async function ({ locals: { room, user: owner }, request }) {
	let body: { email: string } = await request.json();
	if (!body.email) throw error(400, "body.email undefined");

	let db = getDB();
	let user = await db.query.users.findFirst({ where: { email: body.email } });
	if (!user) throw error(400, "no user with email");

	let url = await createVerificationToken("joinroom", { userId: user.id, roomId: room.id }, new Date(Date.now() + 1000 * 60 * 60 * 24 * 7));
	await sendEmail({
		to: user.email,
		subject: `Room invitation: ${room.name}`,
		html: `${owner.name} invited you to join ${room.name}<br>Click to join: <a href="${url}">Join Room</a>`
	});
	
	return Response.json({ success: true, username: user.name, email: user.email });
}