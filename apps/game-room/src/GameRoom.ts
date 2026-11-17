
import { DurableObject } from "cloudflare:workers";
import { getDB, type RoomWithMembers } from "@empire/database";
import { ClientPayloads, EchoPayload, ServerPayloads, type ClientMessage } from "@empire/shared";

export type ClientHandlers = {
	[K in keyof ClientPayloads as `on_${K}`]: (ctx: WebSocket, payload: ClientPayloads[K]) => any;
};

export class GameRoom extends DurableObject implements ClientHandlers {
	dev: boolean;
	info!: RoomWithMembers;
	db!: ReturnType<typeof getDB>;
	
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.dev = env.ENVIRONMENT == "development";
		this.ctx.blockConcurrencyWhile(async () => {
			this.db = getDB(env.db);
			this.info = (await this.db.query.rooms.findFirst({ where: { id: ctx.id.name }, with: { members: true } }))!;
		});
	}

	async alarm() {
		const now = Date.now();
		console.log("alarm ran");
		this.ctx.storage.setAlarm(now + 10000);
	}

	on_ping(ws: WebSocket) {
		this.send(ws, "pong");
	}
	
	on_echo(ws: WebSocket, { message }: EchoPayload) {
		this.send(ws, "echo", { message: `Echo (${this.getUUID(ws)}): ${message}` });
	}

	send<E extends keyof ServerPayloads>(
		ws: WebSocket,
		event: E,
		...[payload]: ServerPayloads[E] extends void ? [payload?: undefined] : [payload: ServerPayloads[E]]
	) {
		ws.send(JSON.stringify({ event, payload }));
	}

	getUUID(ws: WebSocket) {
		let [uuid] = this.ctx.getTags(ws);
		if (!uuid) throw new Error("No UUID");
		return uuid;
	}

	async webSocketMessage(ws: WebSocket, msg: string) {
		let [uuid] = this.ctx.getTags(ws);
		if (!uuid) return;
		let message: ClientMessage = JSON.parse(msg);
		let handler = this[`on_${message.event}`];
		if (typeof handler == "function") handler.call(this, ws, message.payload as any);
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

	async webSocketClose(ws: WebSocket, code: number, reason: string) {
		ws.close(code, reason);
	}
}
