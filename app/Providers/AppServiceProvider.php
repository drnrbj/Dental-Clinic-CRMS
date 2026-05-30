<?php

namespace App\Providers;

use App\Models\Treatment;
use App\Observers\TreatmentObserver;
use App\Policies\TreatmentPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Register observer — auto-completes appointment when treatment is recorded
        Treatment::observe(TreatmentObserver::class);

        // Register policy
        Gate::policy(Treatment::class, TreatmentPolicy::class);
    }
}