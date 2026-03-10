import { zodResolver } from '@hookform/resolvers/zod';
import { Trans } from '@lingui/react/macro';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/ui/loading-button';
import { authClient } from '../../../lib/auth-client';

const schema = z.object({
	email: z.email(),
	password: z.string().min(1),
});

export type LoginFormValues = z.infer<typeof schema>;

export function LoginForm() {
	const [loading, setLoading] = useState(false);

	const handleLogin = async (values: LoginFormValues) => {
		setLoading(true);
		const response = await authClient.signIn.email({
			email: values.email,
			password: values.password,
			callbackURL: '/',
		});

		if (response.error) {
			console.log('Login error:', response.error);
		}
		setLoading(false);
	};

	const form = useForm({
		resolver: zodResolver(schema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle>
						<Trans>Login to phanty</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>Enter your email below to login to your account</Trans>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={form.handleSubmit(handleLogin)}>
						<FieldGroup>
							<Controller
								control={form.control}
								name="email"
								render={({ field, fieldState }) => (
									<Field>
										<FieldLabel htmlFor={field.name}>
											<Trans>Email</Trans>
										</FieldLabel>
										<Input
											{...field}
											id={field.name}
											aria-invalid={fieldState.invalid}
											autoComplete="email"
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
							<Controller
								control={form.control}
								name="password"
								render={({ field, fieldState }) => (
									<Field>
										<div className="flex items-center">
											<FieldLabel htmlFor={field.name}>
												<Trans>Password</Trans>
											</FieldLabel>
										</div>
										<Input
											{...field}
											id={field.name}
											type="password"
											aria-invalid={fieldState.invalid}
											autoComplete="current-password"
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>

							<Field className="mb-3">
								<LoadingButton type="submit" loading={loading}>
									<Trans>Login</Trans>
								</LoadingButton>
							</Field>
						</FieldGroup>

						<div className="flex justify-center">
							<Button variant="link" size="sm">
								<Trans>Forgot your password?</Trans>
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
