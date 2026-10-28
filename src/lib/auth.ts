import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { drizzle } from "drizzle-orm/d1";
import { getRequestEvent } from "$app/server";
import { env as cfEnv } from "cloudflare:workers";
import type { RequestEvent } from "@sveltejs/kit";

import { schema } from "./db/schema";
import sendEmail from "./email.ts";

let cachedAuth: App.Auth | undefined;
let cachedDb: D1Database | undefined;

export function createAuth(source?: App.AuthSource, options?: BetterAuthOptions) {
	const { d1, secret, baseURL } = resolveAuthContext(source);
	if (!d1) throw new Error("Database not found.");
	if (!options && d1 === cachedDb && cachedAuth) return cachedAuth;

	const db = drizzle(d1);
	const instance = betterAuth({
		database: drizzleAdapter(db, { provider: "sqlite", schema }),
		secret, baseURL,
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: true
		},
		emailVerification: {
			autoSignInAfterVerification: true,
			sendOnSignUp: true,
			async sendVerificationEmail({ user, url }) {
				await sendEmail({
					to: user.email,
					subject: "Verify your email address",
					text: `Click the link to verify your email: ${url}`
				});
			}
		},
		onAPIError: {
			onError(error, ctx) {
				console.error(error, ctx);
			}
		},
		...options,
		plugins: [
			...(options?.plugins || []),
			sveltekitCookies(getRequestEvent)
		]
	});

	if (!options) {
		cachedDb = d1;
		cachedAuth = instance;
	}

	return instance;
}

export const auth: App.Auth = new Proxy({} as App.Auth, {
	get(_target, prop) {
		const instance = createAuth();
		const value = instance[prop as keyof typeof instance];
		return typeof value === "function" ? value.bind(instance) : value;
	}
});

function resolveAuthContext(source?: App.AuthSource): {
	d1?: D1Database;
	secret?: string;
	baseURL?: string;
} {
	let d1: D1Database | undefined;
	let secret: string | undefined;
	let baseURL: string | undefined;

	// 1. Direct D1Database binding instance (e.g. platform.env.db)
	if (
		source &&
		typeof (source as D1Database).prepare === "function" &&
		typeof (source as D1Database).batch === "function"
	) {
		d1 = source as D1Database;
	}
	// 2. SvelteKit RequestEvent
	else if (
		source &&
		typeof source === "object" &&
		("platform" in source || "url" in source || "request" in source)
	) {
		const event = source as RequestEvent;
		d1 = event.platform?.env?.db;
		secret = event.platform?.env?.BETTER_AUTH_SECRET;
		baseURL = event.platform?.env?.BETTER_AUTH_URL || event.url?.origin;
	}
	// 3. App.Platform
	else if (
		source &&
		typeof source === "object" &&
		"env" in source &&
		(source as App.Platform).env
	) {
		const platform = source as App.Platform;
		d1 = platform.env?.db;
		secret = platform.env?.BETTER_AUTH_SECRET;
		baseURL = platform.env?.BETTER_AUTH_URL;
	}
	// 4. Platform env object
	else if (source && typeof source === "object" && "db" in source) {
		const env = source as App.Platform["env"];
		d1 = env.db;
		secret = env.BETTER_AUTH_SECRET;
		baseURL = env.BETTER_AUTH_URL;
	}

	// 5. Try SvelteKit getRequestEvent() if not provided directly
	if (!d1) {
		try {
			const event = getRequestEvent();
			if (event) {
				d1 = event.platform?.env?.db;
				secret = secret ?? event.platform?.env?.BETTER_AUTH_SECRET;
				baseURL = baseURL ?? event.platform?.env?.BETTER_AUTH_URL ?? event.url?.origin;
			}
		} catch {
			// Outside of active request context
		}
	}

	// 6. Try cloudflare:workers env module (for Cloudflare Workers runtime, wrangler dev, and production)
	if (!d1) {
		try {
			if (cfEnv?.db) {
				d1 = cfEnv.db;
				secret = secret ?? cfEnv.BETTER_AUTH_SECRET;
				baseURL = baseURL ?? (cfEnv as any).BETTER_AUTH_URL;
			}
		} catch {
			// Outside of Cloudflare runtime
		}
	}

	// 7. Environment variable fallbacks
	if (!secret && typeof process !== "undefined" && process.env?.BETTER_AUTH_SECRET) {
		secret = process.env.BETTER_AUTH_SECRET;
	}
	if (!baseURL && typeof process !== "undefined" && process.env?.BETTER_AUTH_URL) {
		baseURL = process.env.BETTER_AUTH_URL;
	}

	return { d1, secret, baseURL };
}
