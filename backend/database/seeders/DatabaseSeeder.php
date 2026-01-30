<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Test Admin
        User::factory()->create([
            'name' => 'Test Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'), // Login with: admin@example.com / password
            'role' => 'admin',
            'status' => 'Active',
        ]);

        // Test Super Admin
        User::factory()->create([
            'name' => 'Test Super Admin',
            'email' => 'superadmin@example.com',
            'password' => Hash::make('password'), // Login with: superadmin@example.com / password
            'role' => 'super_admin',
            'status' => 'Active',
        ]);

        // Example regular user - for reference, but won't be able to log in
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'testuser@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'status' => 'Active',
        ]);
    }
}