<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

if ($argc < 2) {
    fwrite(STDERR, "Usage: php scripts/find_user.php <email>\n");
    exit(1);
}
$email = $argv[1];

$user = \App\Models\User::where('email', $email)->first();
if ($user) {
    echo json_encode([
        'found' => true,
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'role' => $user->role,
        'status' => $user->status,
    ], JSON_PRETTY_PRINT) . PHP_EOL;
} else {
    echo json_encode(['found' => false, 'email' => $email], JSON_PRETTY_PRINT) . PHP_EOL;
}
