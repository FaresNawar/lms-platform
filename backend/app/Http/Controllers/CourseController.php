<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    // GET /api/courses: the catalog
    public function index(Request $request): JsonResponse
    {
        $enrolledIds = $request->user()->enrolledCourses()->pluck('courses.id');

        $courses = Course::where('is_published', true)
            ->with('instructor:id,name')
            ->withCount('lessons')
            ->latest()
            ->get()
            ->map(fn (Course $c) => $this->summary($c, $enrolledIds->contains($c->id)));

        return response()->json($courses);
    }

    // GET /api/courses/{course}: one course with its syllabus
    public function show(Request $request, Course $course): JsonResponse
    {
        abort_unless($course->is_published || $course->instructor_id === $request->user()->id, 404);

        $course->load(['instructor:id,name', 'lessons:id,course_id,title,position']);

        $enrolled = $request->user()->enrolledCourses()->where('courses.id', $course->id)->exists();

        return response()->json([
            'id' => $course->id,
            'title' => $course->title,
            'description' => $course->description,
            'language' => $course->language,
            'instructor' => $course->instructor?->name,
            'enrolled' => $enrolled,
            'can_open' => $enrolled || $course->instructor_id === $request->user()->id,
            'lessons' => $course->lessons->map(fn ($l) => [
                'id' => $l->id,
                'title' => $l->title,
                'position' => $l->position,
            ]),
        ]);
    }

    // POST /api/courses/{course}/enroll
    public function enroll(Request $request, Course $course): JsonResponse
    {
        abort_unless($request->user()->role === 'student', 403, 'Only students can enroll.');
        abort_unless($course->is_published, 404);

        // Safe to call twice: it won't create a duplicate row
        $request->user()->enrolledCourses()->syncWithoutDetaching([$course->id]);

        return response()->json(['enrolled' => true]);
    }

    // GET /api/my-courses: the courses I'm enrolled in
    public function mine(Request $request): JsonResponse
    {
        $courses = $request->user()->enrolledCourses()
            ->with('instructor:id,name')
            ->withCount('lessons')
            ->get()
            ->map(fn (Course $c) => $this->summary($c, true));

        return response()->json($courses);
    }

    private function summary(Course $c, bool $enrolled): array
    {
        return [
            'id' => $c->id,
            'title' => $c->title,
            'description' => $c->description,
            'language' => $c->language,
            'instructor' => $c->instructor?->name,
            'lessons_count' => $c->lessons_count,
            'enrolled' => $enrolled,
        ];
    }

    // DELETE /api/courses/{course}/enroll
public function unenroll(Request $request, Course $course): JsonResponse
{
    $request->user()->enrolledCourses()->detach($course->id);

    return response()->json(['enrolled' => false]);
}
}