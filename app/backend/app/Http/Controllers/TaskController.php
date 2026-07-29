<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TaskController extends Controller
{
    // 1. List only tasks belonging to the authenticated user
    public function index()
    {
        $tasks = Task::with(['project', 'user'])
                     ->where('user_id', auth()->id())
                     ->get();
        return response()->json($tasks);
    }

    // 2. Create a new task (ensuring the target project belongs to the user)
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'project_id' => 'required|exists:projects,project_id',
            'title' => 'required|string|max:150',
            'description' => 'nullable|string',
            'status' => 'required|in:to_do,in_progress,completed,blocked',
            'priority' => 'required|in:low,medium,high,critical',
            'due_date' => 'nullable|date'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        // Verify that the project belongs to the authenticated user
        $project = Project::where('project_id', $request->project_id)
                          ->where('user_id', auth()->id())
                          ->first();

        if (!$project) {
            return response()->json(['error' => 'Project not found or unauthorized'], 403);
        }

        $task = Task::create([
            'project_id' => $request->project_id,
            'user_id' => auth()->id(),
            'title' => $request->title,
            'description' => $request->description,
            'status' => $request->status,
            'priority' => $request->priority,
            'due_date' => $request->due_date
        ]);

        return response()->json($task, 201);
    }

    // 3. Show a specific task only if it belongs to the authenticated user
    public function show($id)
    {
        $task = Task::with(['project', 'user'])
                    ->where('task_id', $id)
                    ->where('user_id', auth()->id())
                    ->first();

        if (!$task) {
            return response()->json(['error' => 'Task not found'], 404);
        }

        return response()->json($task);
    }

    // 4. Update a task only if it belongs to the authenticated user
    public function update(Request $request, $id)
    {
        $task = Task::where('task_id', $id)
                    ->where('user_id', auth()->id())
                    ->first();

        if (!$task) {
            return response()->json(['error' => 'Task not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'project_id' => 'sometimes|exists:projects,project_id',
            'title' => 'sometimes|string|max:150',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:to_do,in_progress,completed,blocked',
            'priority' => 'sometimes|in:low,medium,high,critical',
            'due_date' => 'nullable|date'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        // If they are updating the project_id, verify the new project also belongs to them
        if ($request->has('project_id')) {
            $project = Project::where('project_id', $request->project_id)
                              ->where('user_id', auth()->id())
                              ->first();

            if (!$project) {
                return response()->json(['error' => 'Target project not found or unauthorized'], 403);
            }
        }

        $task->update($request->all());
        return response()->json($task);
    }

    // 5. Delete a task only if it belongs to the authenticated user
    public function destroy($id)
    {
        $task = Task::where('task_id', $id)
                    ->where('user_id', auth()->id())
                    ->first();

        if (!$task) {
            return response()->json(['error' => 'Task not found'], 404);
        }

        $task->delete();
        return response()->json(['message' => 'Task deleted successfully']);
    }
}