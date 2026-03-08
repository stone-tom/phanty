import { useState } from 'react';
import { Button } from './components/ui/button';

export function App() {
	const [counter, setCounter] = useState(0);

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
				<div className="font-mono text-xs text-muted-foreground">
					(Press <kbd>d</kbd> to toggle dark mode)
				</div>
			</div>
		</div>
	);
}

export default App;
