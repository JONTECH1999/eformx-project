<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Form extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'fields',
        'status',
    ];

    protected $casts = [
        'fields' => 'array',
    ];

    protected $appends = ['analytics'];

    // Relationship to User (works for both User and SuperAdmin via user_id)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relationship to FormResponses
    public function responses()
    {
        return $this->hasMany(FormResponse::class);
    }

    // Computed analytics attribute
    public function getAnalyticsAttribute()
    {
        $totalRespondents = $this->responses()->count();
        $recentActivity = $this->responses()->where('created_at', '>=', now()->subDays(7))->count();

        return [
            'totalRespondents' => $totalRespondents,
            'completionRate' => $totalRespondents > 0 ? 100 : 0, // Simplified for now
            'recentActivity' => $recentActivity,
        ];
    }
}
