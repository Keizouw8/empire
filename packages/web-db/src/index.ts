import { drizzle } from "drizzle-orm/d1";
import { relations } from "./schema";
import { env } from "cloudflare:workers";

export * from "./schema";

export function getDB(database?: D1Database) {
	const db = database ?? (env as any)?.d1;
	if (!db) throw new Error("Database not found.");
	return drizzle(db, { relations });
}