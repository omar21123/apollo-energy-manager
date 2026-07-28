<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProjectController extends Controller
{
    // 1. List all projects
    public function index()
    {
        $projects = Project::all();
        return response()->json($projects);
    }



    // 2. Create a new project
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:150',
            'description' => 'nullable|string',
            'status' => 'required|in:planned,in_progress,completed,archived',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $project = Project::create([
            'user_id' => auth()->id(),
            'title' => $request->title,
            'description' => $request->description,
            'status' => $request->status,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date
        ]);

        return response()->json($project, 201);
    }
    // 3. Show one specific project
    public function show($id)
    {
        $project = Project::find($id);
        
        if (!$project) {
            return response()->json(['error' => 'Project not found'], 404);
        }

        return response()->json($project);
    }

    // 4. Update a project
    public function update(Request $request, $id)
    {
        $project = Project::find($id);
        
        if (!$project) {
            return response()->json(['error' => 'Project not found'], 404);
        }

        $project->update($request->all());
        return response()->json($project);
    }

    // 5. Delete a project
    public function destroy($id)
    {
        $project = Project::find($id);
        
        if (!$project) {
            return response()->json(['error' => 'Project not found'], 404);
        }

        $project->delete();
        return response()->json(['message' => 'Project deleted successfully']);
    }
}