export { GameRoom } from "./GameRoom";

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return new Response("GameRoom DO Worker");
	}
} satisfies ExportedHandler<Env>;
