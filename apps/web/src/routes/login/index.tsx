import { createFileRoute } from '@tanstack/react-router';
import { PreferencesSwitcher } from '@/components/preferences-switcher';
import { redirectIfAuthenticated } from '@/lib/auth-guards';
import { LoginForm } from './_components/login-form';

export const Route = createFileRoute('/login/')({
	component: LoginPage,
	beforeLoad: async () => {
		await redirectIfAuthenticated();
	},
});

function LoginPage() {
	return (
		<>
			<PreferencesSwitcher />
			<div className="bg-muted flex min-h-svh w-full items-center justify-center p-6 md:p-10">
				<div className="w-full max-w-sm">
					<LoginForm />
				</div>
			</div>
		</>
	);
}
