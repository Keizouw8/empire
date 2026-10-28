import { drizzle } from "drizzle-orm/d1";
import { relations } from "./schema.js";
import { env as cfEnv } from "cloudflare:workers";

export default function getDB(database?: D1Database) {
	const db = database ?? (cfEnv as any)?.db;
	if (!db) throw new Error("Database not found.");
	return drizzle(db, { relations });
}