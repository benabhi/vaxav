<?php

namespace App\Console\Commands\Vaxav;

use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class CreateSuperadminCommand extends VaxavCommand
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
    protected $description = 'Create a new superadmin user';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->signature = self::prefixSignature('create_superadmin {email} {password}');
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $password = $this->argument('password');

        // Validar email y contraseña
        $validator = Validator::make([
            'email' => $email,
            'password' => $password,
        ], [
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string', Password::defaults()],
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }
            return 1;
        }

        // Verificar si el usuario ya existe
        $existingUser = User::where('email', $email)->first();

        // Buscar el rol de superadmin
        $superadminRole = Role::where('slug', 'superadmin')->first();

        if (!$superadminRole) {
            $this->error('Superadmin role not found. Please run database seeders first.');
            return 1;
        }

        try {
            if ($existingUser) {
                // Actualizar el usuario existente
                $existingUser->name = 'Super Administrator';
                $existingUser->password = Hash::make($password);
                $existingUser->email_verified_at = now();
                $existingUser->save();

                // Asegurarse de que tenga el rol de superadmin
                if (!$existingUser->roles()->where('role_id', $superadminRole->id)->exists()) {
                    $existingUser->roles()->attach($superadminRole);
                }

                $admin = $existingUser;
                $this->info("Existing user updated with superadmin privileges!");
            } else {
                // Crear un nuevo usuario superadmin
                $admin = User::create([
                    'name' => 'Super Administrator',
                    'email' => $email,
                    'password' => Hash::make($password),
                    'email_verified_at' => now(),
                ]);

                // Asignar el rol de superadmin
                $admin->roles()->attach($superadminRole);

                $this->info("Superadmin created successfully!");
            }

            $this->info("Email: {$email}");
            $this->info("You can now log in with these credentials.");

            return 0;
        } catch (\Exception $e) {
            $this->error("Error creating/updating superadmin: " . $e->getMessage());
            return 1;
        }
    }
}
