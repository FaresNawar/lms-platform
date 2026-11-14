<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LessonController extends Controller
{
    // GET /api/lessons/{lesson}
    public function show(Request $request, Lesson $lesson): JsonResponse
    {
        $user = $request->user();
        $course = $lesson->course;

        // Only the course's instructor and enrolled students may open lessons
        $allowed = $course->instructor_id === $user->id
            || $user->enrolledCourses()->where('courses.id', $course->id)->exists();
        abort_unless($allowed, 403, 'Enroll in this course to open its lessons.');

        $siblings = $course->lessons()->get(['id']); // already ordered by position
        $index = $siblings->search(fn ($l) => $l->id === $lesson->id);
        $assignment = $lesson->assignments()->first();

        return response()->json([
            'id' => $lesson->id,
            'title' => $lesson->title,
            'content_type' => $lesson->content_type,
            'content' => $lesson->content,
            'position' => $index + 1,
            'total' => $siblings->count(),
            'prev_id' => $siblings->get($index - 1)?->id,
            'next_id' => $siblings->get($index + 1)?->id,
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'language' => $course->language,
            ],
            'assignment' => $assignment ? [
                'id' => $assignment->id,
                'title' => $assignment->title,
                'instructions' => $assignment->instructions,
                'requirements' => $assignment->requirements,
                'starter_code' => $assignment->starter_code,
                'max_score' => $assignment->max_score,
            ] : null,
        ]);
    }
}