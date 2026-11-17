import { env } from "cloudflare:workers";
import type { DurableObject } from "cloudflare:workers";

export interface GameRoomDO extends DurableObject {
	refreshRoom(): Promise<void>;
}

export function getGameRoom(roomId: string): DurableObjectStub<GameRoomDO> {
	if (!env?.DO) throw new Error("DO binding not found");
	return env.DO.get(env.DO.idFromName(roomId)) as DurableObjectStub<GameRoomDO>;
}
