<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function me(Request $request): JsonResponse
    {
        $claims = $request->attributes->get('firebase');
        $user = User::where('firebase_uid', $claims->sub)->first();

        if (! $user) {
            return response()->json(['message' => 'Profile not found.'], 404);
        }

        return response()->json($user);
    }

    public function register(Request $request): JsonResponse
    {
        $claims = $request->attributes->get('firebase');

        $data = $request->validate([
            'name' => 'required|string|max:100',
            'role' => 'required|in:student,instructor',
        ]);

        // Idempotent: registering twice returns the existing profile
        $user = User::where('firebase_uid', $claims->sub)->first();
        if ($user) {
            return response()->json($user);
        }

        $user = new User();
        $user->forceFill([
            'firebase_uid' => $claims->sub,
            'email' => $claims->email ?? null,
            'name' => $data['name'],
            'role' => $data['role'],
        ])->save();

        return response()->json($user, 201);
    }
}