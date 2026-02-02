<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class SuperAdmin extends Model
{
    use HasApiTokens;

    // Match the migration table name
    protected $table = 'super_admins';

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
    ];

    /**
     * Get the forms for the super admin.
     */
    public function forms()
    {
        return $this->hasMany(Form::class, 'user_id');
    }
}
