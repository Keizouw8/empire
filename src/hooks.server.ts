import { auth } from "./lib/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/env";
import type { Handle } from "@sveltejs/kit/hooks";
import { redirect } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
	if (building) return resolve(event);
    if (event.route.id?.startsWith("/auth/") || event.url.pathname.startsWith("/api/auth")) {return svelteKitHandler({ event, resolve, auth, building });}

	let session = await auth.api.getSession({ headers: event.request.headers });
    if (!session) return redirect(307, "/auth/signup");
    
	event.locals.session = session.session;
	event.locals.user = session.user;

	return svelteKitHandler({ event, resolve, auth, building });
};