import GuestLayout from '@/Layouts/GuestLayout';
import RetroInput from '@/Components/RetroUI/RetroInput';
import RetroButton from '@/Components/RetroUI/RetroButton';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="REGISTRO NUEVO PILOTO" />

            <form onSubmit={submit} className="space-y-6">
                <RetroInput
                    label="NOMBRE_PILOTO"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    error={errors.name}
                    prefix="NOMBRE>"
                    autoComplete="name"
                    autoFocus
                />

                <RetroInput
                    label="CANAL_COM (EMAIL)"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                    prefix="MAIL>"
                    autoComplete="username"
                />

                <RetroInput
                    label="CODIGO_SEGURIDAD"
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    prefix="CLAVE>"
                    autoComplete="new-password"
                />

                <RetroInput
                    label="CONFIRMAR_CODIGO"
                    type="password"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    error={errors.password_confirmation}
                    prefix="CONF>"
                    autoComplete="new-password"
                />

                <div className="mt-8 pt-6 border-t border-[#005533] flex items-center justify-between">
                    <Link
                        href={route('login')}
                        className="text-xs text-[#005533] hover:text-[#00ffaa] transition-colors font-mono"
                    >
                        [ ¿YA_REGISTRADO? ]
                    </Link>

                    <RetroButton
                        type="submit"
                        disabled={processing}
                        variant="glow"
                        className="px-6 py-2"
                    >
                        INICIAR_REGISTRO
                    </RetroButton>
                </div>
            </form>
        </GuestLayout>
    );
}
