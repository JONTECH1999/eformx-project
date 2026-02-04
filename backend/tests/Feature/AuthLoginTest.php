<?php

namespace Tests\Feature;

use App\Models\SuperAdmin;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_with_unknown_email_returns_404(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'unknown@example.com',
            'password' => 'anything',
        ]);

        $response->assertStatus(404)
                 ->assertJson(['message' => 'Email not registered']);
    }

    public function test_login_with_wrong_password_returns_401_for_superadmin(): void
    {
        SuperAdmin::create([
            'name' => 'Root',
            'email' => 'root@example.com',
            'password' => Hash::make('correct'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'root@example.com',
            'password' => 'wrong',
        ]);

        $response->assertStatus(401)
                 ->assertJson(['message' => 'Incorrect password']);
    }

    public function test_superadmin_login_success_returns_token(): void
    {
        SuperAdmin::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('secret123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'secret123',
        ]);

        $response->assertOk()
                 ->assertJsonStructure(['id', 'name', 'email', 'role', 'token']);
    }

    public function test_user_login_success_returns_token(): void
    {
        User::factory()->create([
            'email' => 'user@example.com',
            'password' => Hash::make('mypassword'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'user@example.com',
            'password' => 'mypassword',
        ]);

        $response->assertOk()
                 ->assertJsonStructure(['id', 'name', 'email', 'role', 'token']);
    }
}
