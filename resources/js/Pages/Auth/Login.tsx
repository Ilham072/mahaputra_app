import Checkbox from '@/Components/Checkbox';
import FormField from '@/Components/FormField';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Login" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div className="mb-6">
                    <h1 className="text-xl font-semibold text-neutral-950">
                        Login
                    </h1>
                    <p className="mt-1 text-sm text-neutral-600">
                        Masuk menggunakan akun internal Mahaputra Group.
                    </p>
                </div>

                <FormField htmlFor="email" label="Email" error={errors.email}>
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                </FormField>

                <FormField
                    className="mt-4"
                    htmlFor="password"
                    label="Password"
                    error={errors.password}
                >
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                </FormField>

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData(
                                    'remember',
                                    (e.target.checked || false) as false,
                                )
                            }
                        />
                        <span className="ms-2 text-sm text-neutral-600">
                            Ingat saya
                        </span>
                    </label>
                </div>

                <div className="mt-4 flex items-center justify-end">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded-md text-sm text-neutral-600 underline hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-yellow-500 focus:ring-offset-2"
                        >
                            Lupa password?
                        </Link>
                    )}

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Masuk
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
