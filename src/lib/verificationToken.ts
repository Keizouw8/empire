import { randomBytes } from "crypto";
import { uuidv7 } from "uuidv7";
import getDB from "./db/db";
import { verification } from "./db/schema";
import { error } from "@sveltejs/kit";
import { auth } from "./auth";

export async function createVerificationToken(namespace: string, body: any, expiresAt?: Date) {
	if(!expiresAt) expiresAt = new Date(Date.now() + 1000 * 60 * 10);
	let token = randomBytes(32).toString("hex");
	let [row] = await getDB().insert(verification).values({
		identifier: `${namespace}-${token}`,
		value: JSON.stringify({ body }),
		createdAt: new Date(),
		updatedAt: new Date(),
		expiresAt
	}).returning({ identifier: verification.identifier });
	if (!row) throw error(500, "unable to add verification token");
	if (!row.identifier.includes(token)) throw error(500, "error generating token");
	return `${auth.options.baseURL}/ott/${namespace}?token=${token}`;
}