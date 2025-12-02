import RetroInput from '@/Components/RetroUI/RetroInput';
import RetroButton from '@/Components/RetroUI/RetroButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Confirm Password" />

            <div className="mb-4 text-sm text-[#00ffaa]">
                AREA SEGURA. POR FAVOR CONFIRME SU CLAVE DE ACCESO ANTES DE CONTINUAR.
            </div>

            <form onSubmit={submit}>
                <div className="mt-4">
                    <RetroInput
                        label="CLAVE"
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                        error={errors.password}
                    />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <RetroButton className="ms-4" disabled={processing}>
                        CONFIRMAR
                    </RetroButton>
                </div>
            </form>
        </GuestLayout>
    );
}
