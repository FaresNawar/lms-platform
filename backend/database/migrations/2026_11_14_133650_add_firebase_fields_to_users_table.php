<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->string('firebase_uid')->nullable()->unique();
        $table->string('role')->default('student');
        $table->string('password')->nullable()->change(); // Firebase owns passwords
    });
}

public function down(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->dropUnique(['firebase_uid']);
        $table->dropColumn(['firebase_uid', 'role']);
    });
}
};
