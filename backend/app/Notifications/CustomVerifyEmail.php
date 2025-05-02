<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;
use App\Models\VerificationCode;

class CustomVerifyEmail extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * El código de verificación.
     *
     * @var string|null
     */
    protected $code;

    /**
     * Create a new notification instance.
     */
    public function __construct($code = null)
    {
        $this->code = $code;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        // Generar un código de verificación si no se proporcionó uno
        if (!$this->code) {
            $this->code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            // Guardar el código en la base de datos
            VerificationCode::where('user_id', $notifiable->id)->delete();
            VerificationCode::create([
                'user_id'    => $notifiable->id,
                'code'       => $this->code,
                'expires_at' => now()->addMinutes(30) // Expira en 30 minutos
            ]);
        }

        // Volver al método estándar que sabemos que funciona
        return (new MailMessage)
            ->subject('Verifica tu Dirección de Email - VAXAV')
            ->greeting('¡Hola ' . $notifiable->name . '!')
            ->line('Gracias por registrarte en VAXAV. Por favor, verifica tu dirección de email haciendo clic en el botón de abajo.')
            ->action('Verificar Email', $verificationUrl)
            ->line('Alternativamente, puedes usar el siguiente código de verificación en la página de verificación:')
            ->line('Tu código de verificación es: **' . $this->code . '**')
            ->line('Este código expirará en 30 minutos.')
            ->line('Si no creaste una cuenta, no es necesario realizar ninguna acción.')
            ->salutation('Saludos, El Equipo de VAXAV');
    }

    /**
     * Get the verification URL for the given notifiable.
     *
     * @param  mixed  $notifiable
     * @return string
     */
    protected function verificationUrl($notifiable)
    {
        $url = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
            [
                'id'   => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );

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
        return $frontendUrl . "/email/verify?id={$id}&hash={$hash}&{$query}";
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'code' => $this->code,
        ];
    }
}
