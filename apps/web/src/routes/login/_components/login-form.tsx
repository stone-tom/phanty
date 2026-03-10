import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { CircleAlert } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { authClient } from '@/lib/auth-client';

const schema = z.object({
	email: z.email(),
	password: z.string().min(1),
});

export type LoginFormValues = z.infer<typeof schema>;

type LoginError = {
	title: string;
	message: string;
};

export function LoginForm() {
	const [loading, setLoading] = useState(false);
	const [loginError, setLoginError] = useState<LoginError | null>(null);

	const handleLogin = async (values: LoginFormValues) => {
		setLoading(true);
		setLoginError(null);

		try {
			const response = await authClient.signIn.email({
				email: values.email,
				password: values.password,
				callbackURL: '/',
			});

			if (response.error) {
				const { code } = response.error as { code?: string };

				if (code === 'INVALID_EMAIL_OR_PASSWORD') {
					setLoginError({
						title: t`Login failed`,
						message: t`Invalid email or password`,
					});
				} else {
					setLoginError({
						title: t`Something went wrong`,
						message: t`Please try again later`,
					});
				}
			}
		} catch {
			setLoginError({
				title: t`Something went wrong`,
				message: t`Please try again later`,
			});
		} finally {
			setLoading(false);
		}
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
							{loginError && (
								<Alert variant="destructive" className="border-destructive">
									<CircleAlert />
									<AlertTitle>{loginError.title}</AlertTitle>
									<AlertDescription>{loginError.message}</AlertDescription>
								</Alert>
							)}
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
