<?php

namespace App\Http\Controllers;

use App\Models\Form;
use App\Models\FormResponse;
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
        $form = Auth::user()->forms()->findOrFail($formId);
        $responses = $form->responses()->latest()->get();

        return response()->json($responses);
    }
}
