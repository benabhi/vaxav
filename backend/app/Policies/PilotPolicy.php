<?php

namespace App\Policies;

use App\Models\Pilot;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PilotPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the pilot.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Pilot  $pilot
     * @return bool
     */
    public function view(User $user, Pilot $pilot): bool
    {
        // Users can view their own pilot
        if ($user->id === $pilot->user_id) {
            return true;
        }

        // Admins and moderators can view any pilot
        return $user->isAdmin() || $user->isModerator();
    }

    /**
     * Determine whether the user can update the pilot.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Pilot  $pilot
     * @return bool
     */
    public function update(User $user, Pilot $pilot): bool
    {
        // Users can update their own pilot
        if ($user->id === $pilot->user_id) {
            return true;
        }

        // Only admins can update any pilot
        return $user->isAdmin();
    }
}
