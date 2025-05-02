<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use App\Models\VerificationCode;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Personalizar el email de verificación
        VerifyEmail::toMailUsing(function ($notifiable, $url) {
            // Extraer los parámetros de la URL
            $parsedUrl = parse_url($url);
            $path = $parsedUrl['path'] ?? '';
            $query = $parsedUrl['query'] ?? '';

            // Extraer id y hash del path
            preg_match('/\/email\/verify\/(\d+)\/([^\/]+)/', $path, $matches);
            $id = $matches[1] ?? '';
            $hash = $matches[2] ?? '';

            // Construir la URL del frontend
            $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
            $verificationUrl = $frontendUrl . "/email/verify?id={$id}&hash={$hash}&{$query}";

            // Generar un código de verificación de 6 dígitos
            $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            // Guardar el código en la base de datos
            VerificationCode::where('user_id', $notifiable->id)->delete();
            VerificationCode::create([
                'user_id'    => $notifiable->id,
                'code'       => $code,
                'expires_at' => now()->addMinutes(30) // Expira en 30 minutos
            ]);

            return (new MailMessage)
                ->subject('Verifica tu Dirección de Email - VAXAV')
                ->greeting('¡Hola ' . $notifiable->name . '!')
                ->line('Gracias por registrarte en VAXAV. Por favor, verifica tu dirección de email haciendo clic en el botón de abajo.')
                ->action('Verificar Email', $verificationUrl)
                ->line('Alternativamente, puedes usar el siguiente código de verificación en la página de verificación:')
                ->line('Tu código de verificación es: **' . $code . '**')
                ->line('Este código expirará en 30 minutos.')
                ->line('Si no creaste una cuenta, no es necesario realizar ninguna acción.')
                ->salutation('Saludos, El Equipo de VAXAV');
        });
    }
}
