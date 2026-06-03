<?php

use App\Http\Controllers\CampaignController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::post('/campaign/store', [CampaignController::class, 'create'])->name('campaign.store');
Route::get('/campaign/{campaign}', [CampaignController::class, 'show'])->name('campaign.show');

require __DIR__.'/settings.php';
