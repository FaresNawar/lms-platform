<?php

namespace App\Http\Middleware;

use Closure;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class FirebaseAuth
{
    private const CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();
        if (! $token) {
            return response()->json(['message' => 'Missing token.'], 401);
        }

        $projectId = config('services.firebase.project_id');

        try {
            JWT::$leeway = 60; // tolerate small clock drift
            $claims = JWT::decode($token, $this->publicKeys());
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Invalid or expired token.'], 401);
        }

        // The signature is valid, but was it issued for OUR Firebase project?
        if (($claims->aud ?? null) !== $projectId
            || ($claims->iss ?? null) !== "https://securetoken.google.com/{$projectId}"
            || empty($claims->sub)) {
            return response()->json(['message' => 'Token not issued for this project.'], 401);
        }

        $request->attributes->set('firebase', $claims);

        return $next($request);
    }

    private function publicKeys(): array
    {
        $certs = Cache::remember(
            'firebase_public_certs',
            3600,
            fn () => Http::get(self::CERTS_URL)->throw()->json()
        );

        return array_map(fn ($cert) => new Key($cert, 'RS256'), $certs);
    }
}