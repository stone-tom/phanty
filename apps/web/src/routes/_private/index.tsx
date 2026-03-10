import {
	createFileRoute,
	getRouteApi,
	useNavigate,
} from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

export const Route = createFileRoute('/_private/')({
	component: HomePage,
});

const privateRouteApi = getRouteApi('/_private');

function HomePage() {
	const navigate = useNavigate();
	const { user } = privateRouteApi.useRouteContext();
	const handleLogout = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					navigate({ to: '/login' });
				},
			},
		});
	};

	return (
		<div className="space-y-2">
			<div className="mt-2">
				<p>
					Logged in as <strong>{user.email}</strong>
				</p>
			</div>
			<Button type="button" variant="outline" onClick={handleLogout}>
				Logout
			</Button>
		</div>
	);
}
