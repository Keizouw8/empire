export { GameRoom } from "./GameRoom";
import { getDB } from "@empire/web-db";

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {		
		if ((env.ENVIRONMENT as string) == "development") {
			let match = new URL(request.url).pathname.match(/\/([^/]+)/);
			if (match) {
				let [, id] = match;
				let exists = await getDB(env.db).query.rooms.findFirst({ where: { id } });
				if (!exists) return new Response("Room not found", { status: 404 });
				return env.DO.get(env.DO.idFromName(id)).fetch(request);
			}
		}
		return new Response("GameRoom DO Worker")
	}
} satisfies ExportedHandler<Env>;
