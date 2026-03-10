import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { redirectIfAuthenticated } from '@/lib/auth-guards';

export const Route = createFileRoute('/login/')({
	component: LoginPage,
	beforeLoad: async () => {
		await redirectIfAuthenticated();
	},
});

function LoginPage() {
	const [counter, setCounter] = useState(0);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleLogin = async () => {
		setError(null);
		setIsSubmitting(true);

		const response = await authClient.signIn.email({
			email,
			password,
			callbackURL: '/',
		});

		if (response.error?.message) {
			setError(response.error.message);
		}

		setIsSubmitting(false);
	};

	const increment = () => setCounter((prev) => prev + 1);
	const reset = () => setCounter(0);
	return (
		<div className="flex min-h-svh p-6">
			<div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
				<div>
					<h1 className="font-medium text-2xl">Welcome to phanty!</h1>

					<Button className="mt-2" onClick={increment}>
						Increment
					</Button>
					<Button variant="outline" className="mt-2 ml-2" onClick={reset}>
						Reset
					</Button>
					<p>Counter: {counter}</p>
				</div>
				<div>
					<div className="flex items-center gap-2">
						<input
							type="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							className="rounded-md border px-3 py-2"
							placeholder="Email"
						/>
						<input
							type="password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							className="rounded-md border px-3 py-2"
							placeholder="Password"
						/>
						<Button type="button" onClick={handleLogin} disabled={isSubmitting}>
							Login
						</Button>
					</div>
					{error && <p className="mt-2 text-red-500">{error}</p>}
				</div>
				<div className="font-mono text-xs text-muted-foreground">
					(Press <kbd>d</kbd> to toggle dark mode)
				</div>
			</div>
		</div>
	);
}
