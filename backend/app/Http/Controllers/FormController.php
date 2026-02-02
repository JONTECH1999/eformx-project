<?php

namespace App\Http\Controllers;

use App\Models\Form;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FormController extends Controller
{
    /**
     * Display a listing of the user's forms.
     */
    public function index()
    {
        $user = Auth::user();
        $forms = $user->forms()->with('responses')->latest()->get();


        return response()->json($forms);
    }

    /**
     * Store a newly created form.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'fields' => 'nullable|array',
            'status' => 'nullable|in:draft,active,closed',
        ]);

        $form = Auth::user()->forms()->create($validated);

        return response()->json($form, 201);
    }

    /**
     * Display the specified form with responses.
     */
    public function show($id)
    {
        $form = Auth::user()->forms()->with('responses')->findOrFail($id);

        return response()->json($form);
    }

    /**
     * Display the specified form for public filling (no auth required).
     */
    public function showPublic($id)
    {
        $form = Form::findOrFail($id);

        // Only allow active forms to be viewed publicly
        if ($form->status !== 'active') {
            return response()->json(['message' => 'This form is currently inactive and not accepting responses.'], 403);
        }

        // Return only necessary fields for public view
        return response()->json([
            'id' => $form->id,
            'title' => $form->title,
            'description' => $form->description,
            'fields' => $form->fields,
            'status' => $form->status,
        ]);
    }

    /**
     * Update the specified form.
     */
    public function update(Request $request, $id)
    {
        $form = Auth::user()->forms()->findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'fields' => 'nullable|array',
            'status' => 'nullable|in:draft,active,closed',
        ]);

        $form->update($validated);

        return response()->json($form);
    }

    /**
     * Remove the specified form.
     */
    public function destroy($id)
    {
        $form = Auth::user()->forms()->findOrFail($id);
        $form->delete();

        return response()->json(['message' => 'Form deleted successfully'], 200);
    }

    /**
     * Get analytics for a specific form.
     */
    public function analytics($id)
    {
        $form = Auth::user()->forms()->findOrFail($id);

        return response()->json([
            'form_id' => $form->id,
            'title' => $form->title,
            'analytics' => $form->analytics,
        ]);
    }
}
