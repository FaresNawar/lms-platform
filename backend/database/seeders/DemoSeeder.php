<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        if (Course::exists()) {
            return; // don't duplicate if run twice
        }

        $teacher = new User();
        $teacher->forceFill([
            'name' => 'Dr. Demo Instructor',
            'email' => 'instructor@demo.test',
            'role' => 'instructor',
        ])->save();

        $web = Course::create([
            'instructor_id' => $teacher->id,
            'title' => 'Intro to Web Development',
            'description' => 'HTML, CSS and a little JavaScript: build your first web page.',
            'language' => 'web',
            'is_published' => true,
        ]);

        $lesson = $web->lessons()->create([
            'title' => 'Your First HTML Page',
            'position' => 1,
            'content' => "# Your First HTML Page\n\nEvery web page is built from **elements**. Try an `<h1>` heading and a `<p>` paragraph.",
        ]);

        $lesson->assignments()->create([
            'title' => 'Hello, Web',
            'instructions' => 'Create a page with an h1 heading that says "Hello, Web" and a paragraph about yourself.',
            'requirements' => 'Must contain an <h1> with the text "Hello, Web" and at least one <p> element.',
            'starter_code' => "<!-- Write your HTML here -->\n",
        ]);

        $python = Course::create([
            'instructor_id' => $teacher->id,
            'title' => 'Python Basics',
            'description' => 'Variables, loops and functions, one small program at a time.',
            'language' => 'python',
            'is_published' => true,
        ]);

        $lesson = $python->lessons()->create([
            'title' => 'Variables and print()',
            'position' => 1,
            'content' => "# Variables and print()\n\nA variable is a name for a value:\n\n```python\nname = \"Ada\"\nprint(name)\n```",
        ]);

        $lesson->assignments()->create([
            'title' => 'Greet Yourself',
            'instructions' => 'Store your name in a variable and print "Hello, <your name>!".',
            'requirements' => 'Must use a variable and call print(). Output must start with "Hello,".',
            'starter_code' => "# Write your Python here\n",
        ]);
    }
}