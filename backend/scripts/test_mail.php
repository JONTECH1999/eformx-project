<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Force log mailer for this test
config(['mail.default' => 'log']);

// Send the test email
\Illuminate\Support\Facades\Mail::to('admin.example@gmail.com')
    ->send(new \App\Mail\AccountCreatedMail('Admin User', 'admin.example@gmail.com', 'TempPass123!'));

echo "Test email dispatched to log mailer." . PHP_EOL;
