<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class TreatmentController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Treatments/Index');
    }
}