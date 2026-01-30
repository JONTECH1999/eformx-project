<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FormResponse extends Model
{
    use HasFactory;

    protected $fillable = [
        'form_id',
        'respondent_name',
        'respondent_email',
        'responses',
    ];

    protected $casts = [
        'responses' => 'array',
    ];

    // Relationship to Form
    public function form()
    {
        return $this->belongsTo(Form::class);
    }
}
