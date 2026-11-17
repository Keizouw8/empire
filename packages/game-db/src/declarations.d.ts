
declare module "*.sql" {
	const content: string;
	export default content;
}

declare module "*/migrations.js" {
	const migrations: {
		migrations: Record<string, string>;
	};
	export default migrations;
}
