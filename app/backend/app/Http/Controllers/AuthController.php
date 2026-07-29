<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:100',
            'last_name'  => 'required|string|max:100',
            'email'      => 'required|string|email|max:150|unique:users,email',
            'password'   => 'required|string|min:6',

            'phone'      => 'nullable|string|max:20',
            'job_title'  => 'nullable|string|max:100',
            'company'    => 'nullable|string|max:150',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $user = User::create([
            'first_name'     => $request->first_name,
            'last_name'      => $request->last_name,
            'email'          => $request->email,
            'password'       => Hash::make($request->password),
            'phone'          => $request->phone,
            'job_title'      => $request->job_title,
            'company'        => $request->company,
            'account_status' => 'active',
        ]);

        // Send email verification
        $user->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'User successfully registered. A verification email has been sent to your inbox.',
            'user' => $user
        ], 201);
    }

    /**
     * Login.
     */
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (!$token = auth()->attempt($credentials)) {
            return response()->json([
                'error' => 'Unauthorized - Wrong email or password'
            ], 401);
        }

        $user = auth()->user();

        if (is_null($user->email_verified_at)) {
            auth()->logout();

            return response()->json([
                'error' => 'Please verify your email address before logging in.'
            ], 403);
        }

        return $this->respondWithToken($token);
    }

    /**
     * Update profile.
     */
    public function updateProfile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'sometimes|required|string|max:100',
            'last_name'  => 'sometimes|required|string|max:100',
            'phone'      => 'nullable|string|max:20',
            'job_title'  => 'nullable|string|max:100',
            'company'    => 'nullable|string|max:150',
            'avatar_path'=> 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $user = auth()->user();

        if ($request->has('first_name')) {
            $user->first_name = $request->first_name;
        }

        if ($request->has('last_name')) {
            $user->last_name = $request->last_name;
        }

        if ($request->has('phone')) {
            $user->phone = $request->phone;
        }

        if ($request->has('job_title')) {
            $user->job_title = $request->job_title;
        }

        if ($request->has('company')) {
            $user->company = $request->company;
        }

        if ($request->has('avatar_path')) {
            $user->avatar_path = $request->avatar_path;
        }

        $user->save();

        return response()->json([
            'message' => 'Profile successfully updated.',
            'user' => $user
        ], 200);
    }

    /**
     * Change password.
     */
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $user = auth()->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'error' => 'Current password does not match.'
            ], 400);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'Password successfully changed.'
        ], 200);
    }

    /**
     * Get authenticated user.
     */
    public function me()
    {
        return response()->json(auth()->user());
    }

    /**
     * Logout.
     */
    public function logout()
    {
        auth()->logout();

        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }

    /**
     * JWT response.
     */
    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type'   => 'bearer',
            'expires_in'   => auth()->factory()->getTTL() * 60,
        ]);
    }
}