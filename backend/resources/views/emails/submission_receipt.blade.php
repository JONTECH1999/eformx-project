<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Submission Receipt</title>
</head>

<body
    style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7f6; padding: 20px;">

    <div
        style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #4f46e5; margin-bottom: 20px; text-align: center;">Submission Received</h2>

        <p style="font-size: 16px;">Hello,</p>

        <p>Thank you for filling out <strong>{{ $form->title }}</strong>. We have successfully received your response.
        </p>

        <div style="margin: 25px 0;">
            <h3 style="border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; color: #111827;">Your Responses:</h3>

            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px;">
                @foreach($submissionData as $item)
                    <div style="margin-bottom: 15px;">
                        <p style="font-weight: bold; margin: 0 0 5px; color: #374151;">{{ $item['label'] ?? 'Question' }}
                        </p>
                        <p style="margin: 0; padding-left: 10px; border-left: 3px solid #d1d5db; color: #4b5563;">
                            @if(is_array($item['value']))
                                {{ implode(', ', $item['value']) }}
                            @else
                                {{ $item['value'] ?? '(No answer)' }}
                            @endif
                        </p>
                    </div>
                @endforeach
            </div>
        </div>

        <p>If you have any questions, please contact the form owner.</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
            Powered by eFormX
        </p>
    </div>

</body>

</html>