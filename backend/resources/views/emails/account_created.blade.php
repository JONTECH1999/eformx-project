<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Account Created</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
    <h2 style="margin-bottom: 0.5rem;">Hello {{ $name }},</h2>
    <p>Your admin (creator) account has been created by the Super Admin.</p>

    <div style="background:#f5f5f5; padding: 12px; border-radius: 6px; margin: 16px 0;">
        <p style="margin: 0 0 8px;"><strong>Login Email (Gmail):</strong> {{ $email }}</p>
        <p style="margin: 0;"><strong>Temporary Password:</strong> {{ $password }}</p>
    </div>

    <p>For security, please log in and change your password immediately after your first sign-in.</p>

    <p style="margin-top: 16px;">If you did not expect this email, please contact support or your Super Admin.</p>

    <p style="margin-top: 24px;">Thanks,<br/>EFormX Team</p>
</body>
</html>
