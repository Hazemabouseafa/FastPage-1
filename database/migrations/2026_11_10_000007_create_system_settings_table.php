<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique()->index();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, number, boolean, json
            $table->string('group')->default('general')->index();
            $table->string('description')->nullable();
            $table->timestamps();
        });

        // Insert initial default annual price setting
        DB::table('system_settings')->insert([
            'key' => 'annual_subscription_price',
            'value' => '300',
            'type' => 'number',
            'group' => 'pricing',
            'description' => 'سعر الاشتراك السنوي لمطاعم FastPage بالجنيه المصري',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};
