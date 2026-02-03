<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// This uses current .env settings (SMTP)
try {
    \Illuminate\Support\Facades\Mail::to('admin.example@gmail.com')
        ->send(new \App\Mail\AccountCreatedMail('SMTP Test', 'admin.example@gmail.com', 'TempPass123!'));
    echo "SMTP test email dispatched successfully." . PHP_EOL;
} catch (Throwable $e) {
    echo "SMTP send failed: " . $e->getMessage() . PHP_EOL;
}
