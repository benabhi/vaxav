<?php

namespace App\Console\Commands\Vaxav;

use App\Models\User;
use Illuminate\Support\Facades\Log;

class EmailVerificationCommand extends VaxavCommand
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature;

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send a verification email to the specified user';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->signature = self::prefixSignature('mail_confirmation {email}');
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("User with email {$email} not found.");
            return 1;
        }

        $this->info("Sending verification email to {$email}...");
        
        try {
            // Marcar el email como no verificado para poder enviar el correo
            $user->email_verified_at = null;
            $user->save();
            
            // Enviar el correo de verificación
            $user->sendEmailVerificationNotification();
            
            $this->info("Verification email sent successfully!");
            Log::info("Verification email sent to {$email}");
            
            return 0;
        } catch (\Exception $e) {
            $this->error("Error sending verification email: " . $e->getMessage());
            Log::error("Error sending verification email to {$email}: " . $e->getMessage());
            
            return 1;
        }
    }
}
