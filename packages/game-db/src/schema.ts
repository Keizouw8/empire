import { defineRelations } from "drizzle-orm";
import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";

export const players = sqliteTable("players", {
	id: text("id").primaryKey()
});

export const empires = sqliteTable("empires", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	color: text("color").notNull().$defaultFn(() => `#${Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, "0")}`),
	ownerId: text("owner_id").references(() => players.id, { onDelete: "set null" })
});

export const territories = sqliteTable("territories", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	population: integer("population").notNull().default(1),
	maxPopulation: integer("max_population").notNull().default(1)
});

export const armies = sqliteTable("armies", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	empireId: integer("empire_id").notNull().references(() => empires.id, { onDelete: "cascade" }),
	territoryId: text("territory_id").notNull().references(() => territories.id, { onDelete: "cascade" }),
	population: integer("population").notNull().default(1)
});

export const territoryEdges = sqliteTable("territory_edges", {
	fromId: text("from_id").notNull().references(() => territories.id, { onDelete: "cascade" }),
	toId: text("to_id").notNull().references(() => territories.id, { onDelete: "cascade" }),
	length: integer("length").notNull().default(1)
}, (table) => [primaryKey({ columns: [table.fromId, table.toId] })]);

export const empireMembers = sqliteTable("empire_members", {
	empireId: text("empire_id").notNull().references(() => empires.id, { onDelete: "cascade" }),
	playerId: text("player_id").notNull().references(() => players.id, { onDelete: "cascade" })
}, (table) => [primaryKey({ columns: [table.empireId, table.playerId] })]);

export const empireTerritories = sqliteTable("empire_territories", {
	empireId: text("empire_id").notNull().references(() => empires.id, { onDelete: "cascade" }),
	territoryId: text("territory_id").notNull().references(() => territories.id, { onDelete: "cascade" })
}, (table) => [primaryKey({ columns: [table.empireId, table.territoryId] })]);

export const relations = defineRelations({ players, empires, armies, territories, empireMembers, empireTerritories, territoryEdges }, (r) => ({
	players: {
		empires: r.many.empires({
			from: r.players.id.through(r.empireMembers.playerId),
			to: r.empires.id.through(r.empireMembers.empireId)
		})
	},
	empires: {
		owner: r.one.players({
			from: r.empires.ownerId,
			to: r.players.id
		}),
		members: r.many.players({
			from: r.empires.id.through(r.empireMembers.empireId),
			to: r.players.id.through(r.empireMembers.playerId)
		}),
		territories: r.many.territories({
			from: r.empires.id.through(r.empireTerritories.empireId),
			to: r.territories.id.through(r.empireTerritories.territoryId)
		}),
		armies: r.many.armies()
	},
	territories: {
		neighbors: r.many.territoryEdges({
			from: r.territories.id,
			to: r.territoryEdges.fromId
		}),
		armies: r.many.armies()
	},
	armies: {
		empire: r.one.empires({
			from: r.armies.empireId,
			to: r.empires.id,
		}),
		territory: r.one.territories({
			from: r.armies.territoryId,
			to: r.territories.id,
		})
	},
	territoryEdges: {
		territory: r.one.territories({
			from: r.territoryEdges.toId,
			to: r.territories.id,
		})
	}
}));