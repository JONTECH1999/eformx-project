<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Form Response</title>
</head>

<body
    style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7f6; padding: 20px;">

    <div
        style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #4f46e5; margin-bottom: 20px; text-align: center;">New Submission Received!</h2>

        <p style="font-size: 16px;">Hello {{ $form->user->name }},</p>

        <p>Good news! You have received a new response for your form: <strong>{{ $form->title }}</strong>.</p>

        <div style="background-color: #f9fafb; border-left: 4px solid #4f46e5; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">Received on:
                {{ $response->created_at->format('F j, Y, g:i a') }}</p>
        </div>

        <p>You can view the full details of this submission in your dashboard analytics.</p>

        <div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
            <a href="{{ config('app.frontend_url') }}/dashboard"
                style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View
                Response</a>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
            You are receiving this email because you are the owner of this form on eFormX.
        </p>
    </div>

</body>

</html>