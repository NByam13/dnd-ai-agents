<?php

use App\Http\Controllers\CampaignController;
use App\Http\Controllers\CharacterController;
use App\Http\Controllers\GameSessionController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::post('/campaign/store', [CampaignController::class, 'create'])->name('campaign.store');
Route::get('/campaign/{campaign}', [CampaignController::class, 'show'])->name('campaign.show');
Route::post('/campaign/{campaign}/character', [CharacterController::class, 'store'])->name('character.store');
Route::get('/campaign/{campaign}/character', [CharacterController::class, 'index'])->name('character.index');
Route::post('/campaign/{campaign}/session', [GameSessionController::class, 'store'])->name('game_session.store');
Route::get('/session/{session}', [GameSessionController::class, 'show'])->name('game_session.show');
require __DIR__.'/settings.php';
