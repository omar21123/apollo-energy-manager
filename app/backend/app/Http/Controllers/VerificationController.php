<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Auth\Events\Verified;

class VerificationController extends Controller
{
    /**
     * Send email verification email.
     */
    public function sendVerificationEmail(Request $request)
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email already verified.'
            ], 400);
        }

        $user->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Verification link sent successfully.'
        ]);
    }

    /**
     * Verify the user's email.
     */
    public function verify(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        // Invalid verification link
        if (! hash_equals($hash, sha1($user->getEmailForVerification()))) {
            return redirect()->away(
                config('app.frontend_url') . '/login?status=invalid'
            );
        }

        // Already verified
        if ($user->hasVerifiedEmail()) {
            return redirect()->away(
                config('app.frontend_url') . '/login?status=already_verified'
            );
        }

        // Verify email
        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        // Successfully verified
        return redirect()->away(
            config('app.frontend_url') . '/login?status=verified'
        );
    }
}