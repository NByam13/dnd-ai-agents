<?php

use App\Http\Controllers\CampaignController;
use App\Http\Controllers\CharacterController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::post('/campaign/store', [CampaignController::class, 'create'])->name('campaign.store');
Route::get('/campaign/{campaign}', [CampaignController::class, 'show'])->name('campaign.show');
Route::post('/campaign/{campaign}/character', [CharacterController::class, 'store'])->name('character.store');

require __DIR__.'/settings.php';
