<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Form;
use App\Models\FormResponse;

class FormResponseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find the "Product Feedback Survey" form created in FormSeeder
        $form = Form::where('title', 'Product Feedback Survey')->first();

        if (!$form) {
            $this->command->error('Form "Product Feedback Survey" not found. Please run FormSeeder first.');
            return;
        }

        // Sample responses to seed
        $responses = [
            [
                'respondent_name' => 'Alice Johnson',
                'respondent_email' => 'alice@example.com',
                'responses' => [
                    'rating' => 5,
                    'feature_interest' => 'Dynamic Builder',
                    'comments' => 'The builder is incredibly intuitive. I love the drag-and-drop interface!',
                    'recommend' => 'Yes',
                ],
                'created_at' => now()->subDays(5),
            ],
            [
                'respondent_name' => 'Bob Smith',
                'respondent_email' => 'bob@example.com',
                'responses' => [
                    'rating' => 4,
                    'feature_interest' => 'Public Sharing',
                    'comments' => 'Great platform, but I would like more customization options for the public view.',
                    'recommend' => 'Yes',
                ],
                'created_at' => now()->subDays(4),
            ],
            [
                'respondent_name' => 'Charlie Brown',
                'respondent_email' => 'charlie@example.com',
                'responses' => [
                    'rating' => 3,
                    'feature_interest' => 'Analytics Dashboard',
                    'comments' => 'Analytics are decent but could be more detailed. Maybe add export to PDF?',
                    'recommend' => 'Maybe',
                ],
                'created_at' => now()->subDays(3),
            ],
            [
                'respondent_name' => 'Dana White',
                'respondent_email' => 'dana@example.com',
                'responses' => [
                    'rating' => 5,
                    'feature_interest' => 'User Management',
                    'comments' => 'Perfect for our team. The roles and permissions work exactly as expected.',
                    'recommend' => 'Yes',
                ],
                'created_at' => now()->subDays(2),
            ],
            [
                'respondent_name' => 'Eve Black',
                'respondent_email' => 'eve@example.com',
                'responses' => [
                    'rating' => 2,
                    'feature_interest' => 'Dynamic Builder',
                    'comments' => 'Found a few bugs when trying to edit a saved form. Needs stability improvements.',
                    'recommend' => 'No',
                ],
                'created_at' => now()->subDays(1),
            ],
            [
                'respondent_name' => 'Frank Green',
                'respondent_email' => 'frank@example.com',
                'responses' => [
                    'rating' => 4,
                    'feature_interest' => 'Analytics Dashboard',
                    'comments' => 'Really like the visual charts. Makes reporting much easier.',
                    'recommend' => 'Yes',
                ],
                'created_at' => now()->subHours(12),
            ],
            [
                'respondent_name' => 'Grace Lee',
                'respondent_email' => 'grace@example.com',
                'responses' => [
                    'rating' => 5,
                    'feature_interest' => 'Public Sharing',
                    'comments' => 'Sharing forms via link is super fast. No complaints.',
                    'recommend' => 'Yes',
                ],
                'created_at' => now()->subHours(2),
            ],
        ];

        foreach ($responses as $data) {
            FormResponse::create([
                'form_id' => $form->id,
                'respondent_name' => $data['respondent_name'],
                'respondent_email' => $data['respondent_email'],
                'responses' => $data['responses'],
                'created_at' => $data['created_at'],
                'updated_at' => $data['created_at'],
            ]);
        }

        $this->command->info('Seeded ' . count($responses) . ' sample responses for form: ' . $form->title);
    }
}
