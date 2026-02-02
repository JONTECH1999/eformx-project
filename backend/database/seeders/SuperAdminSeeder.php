<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SuperAdmin;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Seed a default Super Admin account for testing.
     */
    public function run(): void
    {
        SuperAdmin::updateOrCreate(
            ['email' => 'admin@eformx.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('admin123'),
            ]
        );
    }
}
