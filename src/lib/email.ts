import { Resend } from "resend";
import { env as cfEnv } from "cloudflare:workers";

export function resend() {
	const key = (cfEnv as any)?.RESEND_API_KEY || process.env?.RESEND_API_KEY;
	if (!key) throw new Error("Cannot find RESEND_API_KEY");
	return new Resend(key);
}

export default async function sendEmail(params: { from?: string, to: string, subject: string, text: string } | { from?: string, to: string, subject: string, html: string }) {
	let from = (cfEnv as any)?.EMAIL_FROM || process.env?.EMAIL_FROM || "";
	const response = await resend().emails.send({ from, ...params });
	if (response.error) throw new Error(`Resend error: ${response.error.message} (${response.error.name})`);
	return response;
}