<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\SuperAdmin;
use App\Models\Form;
use App\Models\FormResponse;
use Illuminate\Support\Facades\Hash;

class FormSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // 1. Create a SuperAdmin
        $superAdmin = SuperAdmin::updateOrCreate(
            ['email' => 'admin@eformx.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('admin123'),
            ]
        );

        // 2. Create a test user
        $user = User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'role' => 'Admin',
                'status' => 'Active',
            ]
        );

        // 3. Create a NEW sample form for testing the public feature
        $form = Form::create([
            'user_id' => $user->id,
            'title' => 'Product Feedback Survey',
            'description' => 'We would love to hear your thoughts on our new eFormX platform. Please fill out this quick survey!',
            'status' => 'active',
            'fields' => [
                [
                    'id' => 'rating',
                    'type' => 'number',
                    'label' => 'Overall Rating (1-5)',
                    'required' => true,
                ],
                [
                    'id' => 'feature_interest',
                    'type' => 'select',
                    'label' => 'Which feature do you like most?',
                    'options' => ['Dynamic Builder', 'Analytics Dashboard', 'Public Sharing', 'User Management'],
                    'required' => true,
                ],
                [
                    'id' => 'comments',
                    'type' => 'textarea',
                    'label' => 'Any additional comments?',
                    'required' => false,
                ],
                [
                    'id' => 'recommend',
                    'type' => 'radio',
                    'label' => 'Would you recommend us?',
                    'options' => ['Yes', 'No', 'Maybe'],
                    'required' => true,
                ],
            ],
        ]);

        $this->command->info('New sample form created successfully! ID: ' . $form->id);
    }
}
