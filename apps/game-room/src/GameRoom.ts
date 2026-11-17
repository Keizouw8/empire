import { DurableObject } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/durable-sqlite";
import { migrate } from "drizzle-orm/durable-sqlite/migrator";
import { getDB, type RoomWithMembers } from "@empire/web-db";
import { ClientPayloads, EchoPayload, ServerPayloads, type ClientMessage } from "@empire/shared";
import { relations, migrations } from "@empire/game-db";

export type ClientHandlers = {
	[K in keyof ClientPayloads as `on_${K}`]: (ctx: WebSocket, payload: ClientPayloads[K]) => any;
};

export class GameRoom extends DurableObject implements ClientHandlers {
	dev: boolean;
	info!: RoomWithMembers;
	d1!: ReturnType<typeof getDB>;
	db = drizzle(this.ctx.storage, { relations });

	on_ping(ws: WebSocket) {
		this.send(ws, "pong");
	}
	
	on_echo(ws: WebSocket, { message }: EchoPayload) {
		this.send(ws, "echo", { message: `Echo (${this.getUUID(ws)}): ${message}` });
	}

	async refreshRoom() {
		let updated = await this.d1.query.rooms.findFirst({ where: { id: this.info.id }, with: { members: true } });
		if (!updated) return await this.destroy();
		this.info = updated;
		for (let ws of this.ctx.getWebSockets()) {
			let uuid = this.getUUID(ws);
			if (!updated.members.some(m => m.id == uuid)) {
				this.send(ws, "leave");
				ws.close(1000, "Removed from room");
				continue;
			}
			this.send(ws, "info", { info: updated });
		}
	}
	
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.dev = env.ENVIRONMENT as string == "development";
		this.ctx.blockConcurrencyWhile(async () => {
			this.d1 = getDB(env.d1);
			this.info = (await this.d1.query.rooms.findFirst({ where: { id: ctx.id.name }, with: { members: true } }))!;
			migrate(this.db, migrations);
		});
	}

	async alarm() {
		const now = Date.now();
		console.log("alarm ran");
		this.ctx.storage.setAlarm(now + 10000);
	}

	async fetch(request: Request) {
		if (request.headers.get("Upgrade") != "websocket") return new Response("Expected upgrade to websocket", { status: 426 });
		let userId = request.headers.get("x-user-id");
		if (this.dev) userId = new URL(request.url).searchParams.get("userId");
		if (!userId) return new Response("unauthenticated", { status: 401 });
		if (!this.info.members.some(m => m.id == userId)) return new Response("user not in room", { status: 401 });
		const { 0: client, 1: server } = new WebSocketPair();
		this.ctx.acceptWebSocket(server, [userId]);
		return new Response(null, { status: 101, webSocket: client });
	}

	async webSocketMessage(ws: WebSocket, msg: string) {
		let [uuid] = this.ctx.getTags(ws);
		if (!uuid) return;
		let message: ClientMessage = JSON.parse(msg);
		let handler = this[`on_${message.event}`];
		if (typeof handler == "function") handler.call(this, ws, message.payload as any);
	}

	async webSocketClose(ws: WebSocket, code: number, reason: string) {
		console.log(`${this.getUUID(ws)} left with code ${code}: ${reason}`);
	}

	private send<E extends keyof ServerPayloads>(
		ws: WebSocket,
		event: E,
		...[payload]: ServerPayloads[E] extends void ? [payload?: undefined] : [payload: ServerPayloads[E]]
	) {
		ws.send(JSON.stringify({ event, payload }));
	}

	private broadcast<E extends keyof ServerPayloads>(
		event: E,
		...[payload]: ServerPayloads[E] extends void ? [payload?: undefined] : [payload: ServerPayloads[E]]
	) {
		this.ctx.getWebSockets().forEach(ws => this.send(ws, event, payload as any));
	}

	private getUUID(ws: WebSocket) {
		let [uuid] = this.ctx.getTags(ws);
		if (!uuid) throw new Error("No UUID");
		return uuid;
	}
	
	private async destroy() {
		this.broadcast("leave");
		await this.ctx.storage.deleteAlarm();
		this.ctx.getWebSockets().forEach(ws => ws.close(1000, "room deleted"));
		await this.ctx.storage.deleteAll();
	}

	private async boardState() {
		return await this.db.query.territories.findMany({
			with: {
				neighbors: {
					columns: { length: true },
					with: { territory: true }
				},
				armies: {
					with: { empire: true }
				}
			}
		});
	}
}
