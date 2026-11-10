<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateSuperAdminCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'saas:admin 
                            {email? : Super Admin Email} 
                            {--name=مدير النظام : Super Admin Name} 
                            {--phone=01000000000 : Egyptian Phone Number} 
                            {--password= : Password}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create or promote a user to Super Admin for the QR Menu SaaS';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = $this->argument('email') ?: $this->ask('Enter Super Admin Email');
        $name = $this->option('name') ?: $this->ask('Enter Name', 'مدير النظام الرئيسي');
        $phone = $this->option('phone') ?: $this->ask('Enter Phone', '01000000000');
        $password = $this->option('password') ?: $this->secret('Enter Password (min 8 characters)');

        if (empty($password)) {
            $this->error('Password cannot be empty.');
            return 1;
        }

        $user = User::where('email', $email)->first();

        if ($user) {
            $user->role = User::ROLE_SUPERADMIN;
            $user->password = Hash::make($password);
            $user->save();
            $this->info("User '{$email}' was successfully promoted to Super Admin.");
        } else {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'phone' => $phone,
                'role' => User::ROLE_SUPERADMIN,
                'password' => Hash::make($password),
                'email_verified_at' => now(),
            ]);
            $this->info("Super Admin '{$email}' created successfully!");
        }

        return 0;
    }
}
