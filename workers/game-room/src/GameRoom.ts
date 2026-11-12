import { DurableObject } from "cloudflare:workers";

export class GameRoom extends DurableObject{
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
	}
}