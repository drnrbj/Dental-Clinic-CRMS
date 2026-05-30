<?php

namespace App\Policies;

use App\Models\Treatment;
use App\Models\User;

class TreatmentPolicy
{
    /**
     * Any authenticated user can view treatments.
     */
    public function view(User $user, Treatment $treatment): bool
    {
        return true;
    }

    /**
     * Any authenticated user can view the treatments list.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Only dentists and admins can record treatments.
     */
    public function create(User $user): bool
    {
        return $user->isDentist() || $user->isAdmin();
    }

    /**
     * Only admins can update recorded treatments.
     */
    public function update(User $user, Treatment $treatment): bool
    {
        return $user->isAdmin();
    }

    /**
     * Only admins can delete treatments.
     */
    public function delete(User $user, Treatment $treatment): bool
    {
        return $user->isAdmin();
    }
}