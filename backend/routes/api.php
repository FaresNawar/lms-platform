<?php

use App\Http\Controllers\AuthController;
use App\Http\Middleware\FirebaseAuth;
use Illuminate\Support\Facades\Route;

Route::middleware(FirebaseAuth::class)->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/register', [AuthController::class, 'register']);
});