import RetroInput from '@/Components/RetroUI/RetroInput';
import RetroButton from '@/Components/RetroUI/RetroButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="mb-4 text-sm text-[#00ffaa]">
                ¿OLVIDO SU CLAVE DE ACCESO? NO HAY PROBLEMA. INGRESE SU CANAL DE COMUNICACION (EMAIL) Y LE ENVIAREMOS UN ENLACE PARA RESTABLECERLA.
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <RetroInput
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    className="mt-1 block w-full"
                    isFocused={true}
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                    label="EMAIL"
                />

                <div className="mt-4 flex items-center justify-end">
                    <RetroButton className="ms-4" disabled={processing}>
                        ENVIAR ENLACE DE RECUPERACION
                    </RetroButton>
                </div>
            </form>
        </GuestLayout>
    );
}
