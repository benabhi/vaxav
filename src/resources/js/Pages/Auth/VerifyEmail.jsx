import RetroButton from '@/Components/RetroUI/RetroButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <div className="mb-4 text-sm text-[#00ffaa]">
                GRACIAS POR REGISTRARSE. ANTES DE COMENZAR, POR FAVOR VERIFIQUE SU CANAL DE COMUNICACION (EMAIL) HACIENDO CLICK EN EL ENLACE QUE ACABAMOS DE ENVIARLE.
                SI NO RECIBIO EL MENSAJE, PODEMOS ENVIARLE OTRO.
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <form onSubmit={submit}>
                <div className="mt-4 flex items-center justify-between">
                    <RetroButton disabled={processing}>
                        REENVIAR VERIFICACION
                    </RetroButton>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-xs text-[#005533] hover:text-[#00ffaa] transition-colors font-mono underline decoration-dotted"
                    >
                        CERRAR_SESION
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
