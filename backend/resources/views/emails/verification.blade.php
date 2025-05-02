@component('mail::message')
# Verifica tu Dirección de Email - VAXAV

¡Hola {{ $user->name }}!

Gracias por registrarte en VAXAV. Por favor, verifica tu dirección de email haciendo clic en el botón de abajo.

@component('mail::button', ['url' => $url])
Verificar Email
@endcomponent

Alternativamente, puedes usar el siguiente código de verificación en la página de verificación:

<div style="text-align: center; margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-radius: 5px;">
    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4f46e5; font-family: monospace;">{{ $code }}</span>
</div>

Este código expirará en 30 minutos.

Si no creaste una cuenta, no es necesario realizar ninguna acción.

Saludos,<br>
El Equipo de VAXAV

@endcomponent
