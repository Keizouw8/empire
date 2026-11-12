import { DurableObject } from "cloudflare:workers";

export class GameRoom extends DurableObject{
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
	}

	async alarm() {
		const now = Date.now();
		console.log("alarm ran");		
		this.ctx.storage.setAlarm(now + 10000);
	}

	async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
		ws.send(`Echo: ${message}`);
	}
	
	async fetch(request: Request) {
		if (request.headers.get("Upgrade") != "websocket") return new Response("Expected upgrade to websocket", { status: 426 });
		let userId = request.headers.get("x-user-id");
		if (!userId) return new Response("unauthenticated", { status: 401 });
		const { 0: client, 1: server } = new WebSocketPair();
		this.ctx.acceptWebSocket(server, [userId]);
		return new Response(null, { status: 101, webSocket: client });
	}

	async webSocketClose(ws: WebSocket, code: number, reason: string) {
		ws.close(code, reason);
	}
}