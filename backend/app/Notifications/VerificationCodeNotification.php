<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VerificationCodeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * El código de verificación.
     *
     * @var string
     */
    protected $code;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $code)
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
        return (new MailMessage)
            ->subject('Código de Verificación - VAXAV')
            ->greeting('¡Hola ' . $notifiable->name . '!')
            ->line('Gracias por registrarte en VAXAV. Para verificar tu dirección de correo electrónico, utiliza el siguiente código:')
            ->line('<div style="font-size: 24px; font-weight: bold; text-align: center; padding: 15px; background-color: #f3f4f6; border-radius: 5px; margin: 20px 0;">' . $this->code . '</div>')
            ->line('Este código expirará en 30 minutos.')
            ->line('Si no has solicitado este código, puedes ignorar este mensaje.')
            ->salutation('Saludos, El Equipo de VAXAV');
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
