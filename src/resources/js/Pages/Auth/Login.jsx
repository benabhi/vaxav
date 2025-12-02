import GuestLayout from '@/Layouts/GuestLayout';
import RetroInput from '@/Components/RetroUI/RetroInput';
import RetroButton from '@/Components/RetroUI/RetroButton';
import RetroCheckbox from '@/Components/RetroUI/RetroCheckbox';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="ACCESO SEGURO" />

            {status && (
                <div className="mb-6 p-3 border border-[#00ffaa] bg-[#001100] text-[#00ffaa] text-xs font-mono">
                    <span className="mr-2">[INFO]</span>{status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <RetroInput
                    label="ID_PILOTO (EMAIL)"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                    prefix="USUARIO>"
                    autoComplete="username"
                    autoFocus
                />

                <RetroInput
                    label="CODIGO_ACCESO (CONTRASEÑA)"
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    prefix="CLAVE>"
                    autoComplete="current-password"
                />

                <div className="flex items-center justify-between mt-6">
                    <RetroCheckbox
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                        label="RECORDAR_SESION"
                    />

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-xs text-[#005533] hover:text-[#00ffaa] transition-colors font-mono underline decoration-dotted"
                        >
                            ¿CREDENCIALES_PERDIDAS?
                        </Link>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-[#005533] flex items-center justify-between">
                    <Link
                        href={route('register')}
                        className="text-xs text-[#005533] hover:text-[#00ffaa] transition-colors font-mono"
                    >
                        [ REGISTRAR_NUEVO_PILOTO ]
                    </Link>

                    <RetroButton
                        type="submit"
                        disabled={processing}
                        variant="glow"
                        className="px-6 py-2"
                    >
                        AUTENTICAR
                    </RetroButton>
                </div>
            </form>
        </GuestLayout>
    );
}
