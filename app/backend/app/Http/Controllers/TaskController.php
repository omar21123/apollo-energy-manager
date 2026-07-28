<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TaskController extends Controller
{
    // List all tasks
    public function index()
    {
        $tasks = Task::with(['project', 'user'])->get();
        return response()->json($tasks);
    }

    // Create a new task
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

        $task = Task::create([
            'project_id' => $request->project_id,
            'user_id' => auth()->id(),
            'title' => $request->title,
            'description' => $request->description,
            'status' => $request->status ?? 'pending',
            'priority' => $request->priority ?? 'medium',
            'due_date' => $request->due_date
        ]);

        return response()->json($task, 201);
    }

    // Show a specific task
    public function show($id)
    {
        $task = Task::with(['project', 'user'])->find($id);

        if (!$task) {
            return response()->json(['error' => 'Task not found'], 404);
        }

        return response()->json($task);
    }

    // Update a task
    public function update(Request $request, $id)
    {
        $task = Task::find($id);

        if (!$task) {
            return response()->json(['error' => 'Task not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'project_id' => 'sometimes|exists:projects,project_id',
            'title' => 'sometimes|string|max:150',
            'description' => 'nullable|string',
            'status' => 'sometimes|string',
            'priority' => 'sometimes|string',
            'due_date' => 'nullable|date'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $task->update($request->all());
        return response()->json($task);
    }

    // Delete a task
    public function destroy($id)
    {
        $task = Task::find($id);

        if (!$task) {
            return response()->json(['error' => 'Task not found'], 404);
        }

        $task->delete();
        return response()->json(['message' => 'Task deleted successfully']);
    }
}