import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { requireAuthenticatedUser } from '@/lib/auth-guards';

export const Route = createFileRoute('/_private')({
	component: PrivateLayout,
	beforeLoad: async () => ({ user: await requireAuthenticatedUser() }),
});

function PrivateLayout() {
	return (
		<div className="p-10">
			<div className="flex gap-2 mb-4">
				<Link
					activeOptions={{ exact: true }}
					to="/"
					className="data-[status=active]:text-primary hover:underline"
				>
					Home
				</Link>
				<Link
					activeOptions={{ exact: true }}
					to="/users"
					className="data-[status=active]:text-primary hover:underline"
				>
					Users
				</Link>
			</div>
			<Outlet />
		</div>
	);
}
