import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import RetroCard from '@/Components/RetroUI/RetroCard';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <RetroCard className="p-4 sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </RetroCard>

                    <RetroCard className="p-4 sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </RetroCard>

                    <RetroCard className="p-4 sm:p-8">
                        <DeleteUserForm className="max-w-xl" />
                    </RetroCard>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
