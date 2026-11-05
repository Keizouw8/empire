// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Session, User } from "better-auth";
import type { RequestEvent } from "@sveltejs/kit";

declare global {
	namespace App {
		interface Platform {
			env: Env;
			cf: CfProperties;
			ctx: ExecutionContext;
		}
		interface Locals {
			user: User | null;
			session: Session | null;
			room: typeof import("$lib/db/schema").rooms.$inferSelect & {
				members: (typeof import("$lib/db/schema").users.$inferSelect)[]
			}
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

		type User = typeof import("$lib/db/schema").users.$inferSelect;
		type NewUser = typeof import("$lib/db/schema").users.$inferInsert;
		type Session = typeof import("$lib/db/schema").sessions.$inferSelect;
		type Account = typeof import("$lib/db/schema").accounts.$inferSelect;
		type Verification = typeof import("$lib/db/schema").verification.$inferSelect;
	}

	type Auth = App.Auth;
	type AuthSource = App.AuthSource;
}

export {};
