import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_private/users')({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_private/users"!</div>;
}
