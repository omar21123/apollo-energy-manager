<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use SoftDeletes;

    // Custom primary key based on your project conventions
    protected $primaryKey = 'task_id';

    // Mass-assignment protection whitelist
    protected $fillable = [
        'project_id',
        'user_id',
        'title',
        'description',
        'status',
        'priority',
        'due_date'
    ];

    // Relationship: A task belongs to a project
    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id', 'project_id');
    }

    // Relationship: A task belongs to a user
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}