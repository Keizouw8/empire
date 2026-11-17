export type ClientMessage = EventMessage<ClientPayloads>;
export type ServerMessage = EventMessage<ServerPayloads>;

type EventMessage<T> = {
	[K in keyof T]: T[K] extends void ? { event: K; payload?: undefined } : { event: K; payload: T[K] };
}[keyof T];

export interface ClientPayloads {
	ping: void;
	echo: EchoPayload;
};
	
export interface ServerPayloads {
	pong: void;
	echo: EchoPayload;
	info: InfoPayload;
};

export interface EchoPayload {
	message: string;
};

export interface InfoPayload {
	info: RoomInfo;
};

export interface RoomMember {
	id: string;
	name: string;
	image: string | null;
}
 
export interface RoomInfo {
	id: string;
	name: string;
	ownerId: string;
	members: RoomMember[];
}