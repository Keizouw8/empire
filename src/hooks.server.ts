import { auth } from "./lib/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/env";
import { sequence, type Handle } from "@sveltejs/kit/hooks";

const routeMiddlewares = import.meta.glob<{ handle: Handle }>(
	"/src/routes/**/_middleware.ts",
	{ eager: true }
);

const middlewaresByRoute = Object.entries(routeMiddlewares)
	.map(([file, mod]) => {
		const routePrefix = file
			.replace("/src/routes", "")
			.replace("/_middleware.ts", "");
		return { prefix: routePrefix, handle: mod.handle };
	})
	.sort((a, b) => a.prefix.split("/").length - b.prefix.split("/").length);

export const handle: Handle = async ({ event, resolve }) => {
	if (building) return resolve(event);

	const matching = middlewaresByRoute
		.filter(mw => event.route.id == mw.prefix || event.route.id?.startsWith(mw.prefix + "/"))
		.map(mw => mw.handle);
	
	if (!matching.length) return svelteKitHandler({ event, resolve, auth, building });
	return sequence(...matching)({ event, resolve: chainedEvent => svelteKitHandler({ event: chainedEvent, resolve, auth, building }) });
};