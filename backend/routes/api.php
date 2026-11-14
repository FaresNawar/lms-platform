<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\CourseController;
use App\Http\Middleware\FirebaseAuth;
use Illuminate\Support\Facades\Route;

// Valid Firebase login is enough
Route::middleware(FirebaseAuth::class)->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/register', [AuthController::class, 'register']);
});

// Valid login AND a profile in our database
Route::middleware(FirebaseAuth::class.':profile')->group(function () {
    Route::get('/courses', [CourseController::class, 'index']);
    Route::get('/courses/{course}', [CourseController::class, 'show']);
    Route::post('/courses/{course}/enroll', [CourseController::class, 'enroll']);
    Route::get('/my-courses', [CourseController::class, 'mine']);
    Route::delete('/courses/{course}/enroll', [CourseController::class, 'unenroll']);
Route::get('/lessons/{lesson}', [LessonController::class, 'show']);
});