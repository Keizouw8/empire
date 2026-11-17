export type GameStatus = "active" | "paused";

export interface Territory {
	id: string;
	name: string;
	population: number;
	adjacentTerritories: string[];
};