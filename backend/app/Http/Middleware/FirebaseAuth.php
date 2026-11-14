<?php

namespace App\Http\Middleware;

use Closure;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

use App\Models\User;

class FirebaseAuth
{
    private const CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

    public function handle(Request $request, Closure $next, string $require = ''): Response
{
    $token = $request->bearerToken();
    if (! $token) {
        return response()->json(['message' => 'Missing token.'], 401);
    }

    $projectId = config('services.firebase.project_id');

    try {
        JWT::$leeway = 60;
        $claims = JWT::decode($token, $this->publicKeys());
    } catch (\Throwable $e) {
        return response()->json(['message' => 'Invalid or expired token.'], 401);
    }

    if (($claims->aud ?? null) !== $projectId
        || ($claims->iss ?? null) !== "https://securetoken.google.com/{$projectId}"
        || empty($claims->sub)) {
        return response()->json(['message' => 'Token not issued for this project.'], 401);
    }

    $request->attributes->set('firebase', $claims);

    // Attach our own database user (null if they haven't registered a profile yet)
    $user = User::where('firebase_uid', $claims->sub)->first();
    $request->setUserResolver(fn () => $user);

    if ($require === 'profile' && ! $user) {
        return response()->json(['message' => 'Profile not found.'], 404);
    }

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