import { env } from "cloudflare:workers";
import type { DurableObject } from "cloudflare:workers";

export interface GameRoomDO extends DurableObject {
	refreshRoom(): Promise<void>;
}

export function getGameRoom(roomId: string): DurableObjectStub<GameRoomDO> {
	if (!env?.do) throw new Error("do binding not found");
	return env.do.get(env.do.idFromName(roomId)) as DurableObjectStub<GameRoomDO>;
}
