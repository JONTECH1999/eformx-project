<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

if ($argc < 2) {
    fwrite(STDERR, "Usage: php scripts/delete_user.php <email>\n");
    exit(1);
}
$email = $argv[1];

$user = \App\Models\User::where('email', $email)->first();
if (!$user) {
    echo "No user found with email: {$email}\n";
    exit(0);
}

$deletedId = $user->id;
$user->delete();

echo "Deleted user ID {$deletedId} with email {$email}.\n";
