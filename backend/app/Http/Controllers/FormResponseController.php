<?php

namespace App\Http\Controllers;

use App\Models\Form;
use App\Models\FormResponse;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FormResponseController extends Controller
{
    /**
     * Store a new form response (public endpoint).
     */
    public function store(Request $request, $formId)
    {
        $form = Form::findOrFail($formId);

        // Check if form is active
        if ($form->status !== 'active') {
            return response()->json(['message' => 'This form is not accepting responses'], 403);
        }

        $validated = $request->validate([
            'respondent_name' => 'nullable|string|max:255',
            'respondent_email' => 'nullable|email|max:255',
            'responses' => 'required|array',
        ]);

        $response = $form->responses()->create($validated);

        // --- Notification Logic ---

        // 1. Notify Form Owner
        try {
            // Ensure owner has an email and load the user if not loaded
            if ($form->user && $form->user->email) {
                \Illuminate\Support\Facades\Mail::to($form->user->email)
                    ->send(new \App\Mail\NewFormResponseMail($form, $response));
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send NewFormResponseMail', [
                'form_id' => $form->id,
                'error' => $e->getMessage()
            ]);
        }

        // 2. Send Receipt to Respondent (if email provided)
        try {
            $respondentEmail = null;

            // Priority 1: Check standard 'respondent_email' field
            if (!empty($validated['respondent_email'])) {
                $respondentEmail = $validated['respondent_email'];
            }
            // Priority 2: Scan form fields for an email input
            else {
                // We need to look at the submitted answers and cross-reference with form fields
                // to find one that is likely an email.
                $formFields = $form->fields ?? [];
                $answers = $validated['responses']; // array like [['id' => '...', 'value' => '...'], ...]

                foreach ($formFields as $field) {
                    // Check if field type is email or label contains "email"
                    $isEmailType = isset($field['type']) && $field['type'] === 'email';
                    $isEmailLabel = isset($field['label']) && stripos($field['label'], 'email') !== false;

                    if ($isEmailType || $isEmailLabel) {
                        // Find the answer for this field
                        $fieldId = $field['id'];
                        $answer = collect($answers)->firstWhere('id', $fieldId);

                        if ($answer && !empty($answer['value']) && filter_var($answer['value'], FILTER_VALIDATE_EMAIL)) {
                            $respondentEmail = $answer['value'];
                            break; // Stop after finding first valid email
                        }
                    }
                }
            }

            if ($respondentEmail) {
                \Illuminate\Support\Facades\Mail::to($respondentEmail)
                    ->send(new \App\Mail\FormSubmissionReceiptMail($form, $validated['responses']));
            }

        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send FormSubmissionReceiptMail', [
                'form_id' => $form->id,
                'error' => $e->getMessage()
            ]);
        }

        return response()->json([
            'message' => 'Response submitted successfully',
            'response' => $response
        ], 201);
    }

    /**
     * Get all responses for a specific form (protected endpoint).
     */
    public function index($formId)
    {
        /** @var User $user */
        $user = Auth::user();
        $form = $user->forms()->findOrFail($formId);
        $responses = $form->responses()->latest()->get();

        return response()->json($responses);
    }
}
