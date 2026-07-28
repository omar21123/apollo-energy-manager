<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    // Tell Laravel the custom primary key
    protected $primaryKey = 'project_id';

    // The columns we are allowed to fill
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'status',
        'start_date',
        'end_date',
    ];

    // A Project belongs to one User
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    // A Project can have many Tasks
    public function tasks()
    {
        return $this->hasMany(Task::class, 'project_id', 'project_id');
    }
}