import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

export function App() {
	const [counter, setCounter] = useState(0);

	const { data } = authClient.useSession();

	const handleLogin = async () => {
		const response = await authClient.signIn.email({
			email: 'admin@phanty.app',
			password: 'change-me-please',
		});

		if (response.error) {
			console.log('Login error:', response.error);
		}
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
						<Button type="button" onClick={handleLogin}>
							Login
						</Button>
						{data?.user && (
							<Button
								type="button"
								variant="outline"
								onClick={() => authClient.signOut()}
							>
								Logout
							</Button>
						)}
					</div>
					{data?.user ? (
						<div className="mt-2">
							<p>
								Logged in as <strong>{data.user.email}</strong>
							</p>
						</div>
					) : (
						<div className="mt-2 text-red-500">Not logged in</div>
					)}
				</div>
				<div className="font-mono text-xs text-muted-foreground">
					(Press <kbd>d</kbd> to toggle dark mode)
				</div>
			</div>
		</div>
	);
}

export default App;
