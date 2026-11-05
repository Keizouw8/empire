import { uuidv7 } from "uuidv7";
import { defineRelations } from "drizzle-orm";
import { sqliteTable, primaryKey, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
	image: text("image"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull()
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const sessions = sqliteTable("sessions", {
	id: text("id").primaryKey(),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	token: text("token").notNull().unique(),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" })
});

export const accounts = sqliteTable("accounts", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
	refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
	scope: text("scope"),
	password: text("password"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull()
});

export const verification = sqliteTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }),
	updatedAt: integer("updated_at", { mode: "timestamp" })
});

export const rooms = sqliteTable("rooms", {
	id: text("id").primaryKey().$defaultFn(() => uuidv7()),
	name: text("name").notNull(),
	ownerId: text("owner_id").notNull().references(() => users.id, { onDelete: "cascade" })
});

export const roomMembers = sqliteTable("room_members", {
	roomId: text("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" })
}, (table) => [primaryKey({ columns: [table.roomId, table.userId] })]);

export const relations = defineRelations({ users, rooms, roomMembers }, (r) => ({
	users: {
		rooms: r.many.rooms({
			from: r.users.id.through(r.roomMembers.userId),
			to: r.rooms.id.through(r.roomMembers.roomId)
		})
	},
	rooms: {
		owner: r.one.users({
			from: r.rooms.ownerId,
			to: r.users.id
		}),
		members: r.many.users({
			from: r.rooms.id.through(r.roomMembers.roomId),
			to: r.users.id.through(r.roomMembers.userId)
		})
	}
}));