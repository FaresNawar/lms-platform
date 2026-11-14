<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $guarded = [];

    public function instructor() { return $this->belongsTo(User::class, 'instructor_id'); }
    public function lessons()    { return $this->hasMany(Lesson::class)->orderBy('position'); }
    public function students()   { return $this->belongsToMany(User::class, 'enrollments')->withTimestamps(); }
}