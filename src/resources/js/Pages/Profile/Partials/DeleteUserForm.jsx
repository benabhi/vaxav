import RetroButton from '@/Components/RetroUI/RetroButton';
import RetroInput from '@/Components/RetroUI/RetroInput';
import RetroModal from '@/Components/RetroUI/RetroModal';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-red-500">
                    ELIMINAR_CUENTA
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    ADVERTENCIA: ESTA ACCION ES IRREVERSIBLE. TODOS LOS DATOS SERAN PURGADOS DEL SISTEMA.
                </p>
            </header>

            <RetroButton variant="danger" onClick={confirmUserDeletion}>
                ELIMINAR_CUENTA
            </RetroButton>

            <RetroModal
                isOpen={confirmingUserDeletion}
                onClose={closeModal}
                title="CONFIRMAR ELIMINACION"
            >
                <form onSubmit={deleteUser} className="space-y-6">
                    <p className="text-sm text-[#00ffaa]">
                        ¿ESTA SEGURO QUE DESEA ELIMINAR SU CUENTA? ESTA ACCION NO SE PUEDE DESHACER.
                        POR FAVOR INGRESE SU CLAVE PARA CONFIRMAR.
                    </p>

                    <div className="mt-6">
                        <RetroInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="mt-1 block w-3/4"
                            isFocused
                            placeholder="CLAVE_ACCESO"
                            error={errors.password}
                            label="CLAVE"
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                        <RetroButton variant="ghost" onClick={closeModal}>
                            CANCELAR
                        </RetroButton>

                        <RetroButton variant="danger" disabled={processing}>
                            ELIMINAR_CUENTA
                        </RetroButton>
                    </div>
                </form>
            </RetroModal>
        </section>
    );
}
