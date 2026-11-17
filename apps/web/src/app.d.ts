// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Session, User } from "better-auth";
import type { RequestEvent } from "@sveltejs/kit";
import { users, sessions, accounts, verification, type RoomWithMembers } from "@empire/database";

declare global {
	namespace App {
		interface Platform {
			env: Env;
			cf: CfProperties;
			ctx: ExecutionContext;
		}
		interface Locals {
			user: User;
			session: Session;
			tokenData: any;
			room: RoomWithMembers;
		}

		type Auth = ReturnType<typeof import("$lib/auth").createAuth>;
		type AuthSource =
			| RequestEvent
			| Platform
			| Platform["env"]
			| D1Database
			| {
					platform?: Platform;
					env?: Partial<Platform["env"]>;
					db?: D1Database;
					[key: string]: any;
			  }
			| undefined;

		type User = typeof users.$inferSelect;
		type NewUser = typeof users.$inferInsert;
		type Session = typeof sessions.$inferSelect;
		type Account = typeof accounts.$inferSelect;
		type Verification = typeof verification.$inferSelect;
	}

	type Auth = App.Auth;
	type AuthSource = App.AuthSource;
}

export {};
