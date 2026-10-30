export default function POST({ params }) {
	return Response.json({ id: params.id });
}