import { createAuthClient } from "better-auth/svelte"
export const client = createAuthClient();
export const { useSession, signIn, signUp, signOut } = client;