# Sistema de Comunicaciones

**Parte del:** PRD - Vaxav
**Versión:** 1.0
**Fecha:** 2025-11-29
**Estado:** Documento Vivo - En Desarrollo

## Changelog

### Versión 1.0 (2025-11-29) - Creación Inicial
- ✅ Sistema completo de canales de chat
- ✅ Estructura SQL para mensajes y canales
- ✅ Implementación técnica con Laravel + Alpine.js
- ✅ Polling AJAX para actualización de mensajes
- ✅ Canales contextuales (Sistema, Estación, Corporación, Flota)
- ✅ Mensajes directos (DM) entre jugadores
- ✅ Sistema de bloqueo y anti-spam

[Volver al PRD Master](./PRD-Master.md)

---

## 1. Tipos de Canales

El juego tiene múltiples canales de chat según el contexto del jugador:

### 1.1 Canales Globales/Públicos

**1. Sistema Local**
- Alcance: Todos los pilotos en el mismo sistema solar
- Uso: Coordinación local, avisos de peligro, comercio local
- Ejemplo: "Piratas en Cinturón [Rico], eviten el área"

**2. Estación Local**
- Alcance: Todos los pilotos atracados en la misma estación
- Uso: Comercio, reclutamiento, chat social
- Ejemplo: "Vendiendo Titanita refinada, 500u a 90₡/u"

**3. Ayuda & Novatos**
- Alcance: Global (todo el universo)
- Uso: Preguntas de nuevos jugadores, tutoriales
- Moderación: NPCs moderadores automáticos

**4. Comercio**
- Alcance: Global
- Uso: Anuncios de compra/venta, WTB/WTS
- Límite: 1 mensaje cada 60 segundos para evitar spam

### 1.2 Canales Privados/Grupales

**5. Corporación**
- Alcance: Solo miembros de tu corporación
- Uso: Coordinación corporativa, logística
- Persistente: Mensajes se guardan hasta 30 días

**6. Alianza**
- Alcance: Solo miembros de tu alianza
- Uso: Coordinación multi-corporación
- Requiere: Pertenecer a una alianza

**7. Flota**
- Alcance: Solo miembros de tu flota actual
- Uso: Táctica en tiempo real, órdenes del comandante
- Temporal: Se borra al disolver la flota

**8. Amigos**
- Alcance: Lista de amigos agregados
- Uso: Chat grupal casual entre amigos
- Requiere: Tener al menos 1 amigo agregado

**9. Conversaciones Privadas (DM)**
- Alcance: 1 a 1 entre cualquier piloto
- Uso: Negociaciones privadas, chat personal
- Privacidad: Solo los 2 pilotos pueden ver

---

## 2. Estructura de Base de Datos

### 2.1 Tablas SQL

```sql
-- Tabla de canales de chat
CREATE TABLE chat_channels (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('system', 'station', 'global', 'corporation', 'alliance', 'fleet', 'private') NOT NULL,
    reference_id BIGINT UNSIGNED NULL, -- ID del sistema/estación/corporación/flota
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type_reference (type, reference_id)
);

-- Tabla de mensajes
CREATE TABLE chat_messages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    channel_id BIGINT UNSIGNED NOT NULL,
    pilot_id BIGINT UNSIGNED NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (channel_id) REFERENCES chat_channels(id) ON DELETE CASCADE,
    FOREIGN KEY (pilot_id) REFERENCES pilots(id) ON DELETE CASCADE,
    INDEX idx_channel_created (channel_id, created_at DESC)
);

-- Tabla de suscripciones a canales
CREATE TABLE chat_subscriptions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pilot_id BIGINT UNSIGNED NOT NULL,
    channel_id BIGINT UNSIGNED NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_read_at TIMESTAMP NULL,
    FOREIGN KEY (pilot_id) REFERENCES pilots(id) ON DELETE CASCADE,
    FOREIGN KEY (channel_id) REFERENCES chat_channels(id) ON DELETE CASCADE,
    UNIQUE KEY unique_pilot_channel (pilot_id, channel_id),
    INDEX idx_pilot_active (pilot_id, is_active)
);

-- Tabla de mensajes directos (1 a 1)
CREATE TABLE direct_messages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    from_pilot_id BIGINT UNSIGNED NOT NULL,
    to_pilot_id BIGINT UNSIGNED NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_pilot_id) REFERENCES pilots(id) ON DELETE CASCADE,
    FOREIGN KEY (to_pilot_id) REFERENCES pilots(id) ON DELETE CASCADE,
    INDEX idx_conversation (from_pilot_id, to_pilot_id, created_at),
    INDEX idx_unread (to_pilot_id, is_read)
);

-- Tabla de bloqueos
CREATE TABLE chat_blocks (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pilot_id BIGINT UNSIGNED NOT NULL,
    blocked_pilot_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pilot_id) REFERENCES pilots(id) ON DELETE CASCADE,
    FOREIGN KEY (blocked_pilot_id) REFERENCES pilots(id) ON DELETE CASCADE,
    UNIQUE KEY unique_block (pilot_id, blocked_pilot_id)
);
```

---

## 3. Tecnología de Implementación

### 3.1 Polling con AJAX + Alpine.js (Recomendado)

**Justificación:**
- ✅ Juego basado en ticks (cada 10 minutos) NO requiere tiempo real crítico
- ✅ Polling cada 5 segundos es más que suficiente para chat
- ✅ Arquitectura más simple que WebSockets
- ✅ Compatible con Laravel + Alpine.js
- ✅ Menor carga en servidor

### 3.2 Implementación Frontend (Alpine.js)

```javascript
// En Alpine.js component
Alpine.data('chatComponent', () => ({
    channels: [],
    activeChannel: null,
    messages: [],
    newMessage: '',

    init() {
        // Cargar canales iniciales
        this.loadChannels();

        // Polling cada 5 segundos para nuevos mensajes
        setInterval(() => {
            this.fetchNewMessages();
        }, 5000);
    },

    async loadChannels() {
        const response = await fetch('/api/chat/channels');
        this.channels = await response.json();

        // Seleccionar primer canal por defecto
        if (this.channels.length > 0 && !this.activeChannel) {
            this.switchChannel(this.channels[0]);
        }
    },

    async switchChannel(channel) {
        this.activeChannel = channel;
        this.messages = [];
        await this.fetchAllMessages();
    },

    async fetchAllMessages() {
        if (!this.activeChannel) return;

        const response = await fetch(
            `/api/chat/channels/${this.activeChannel.id}/messages`
        );
        this.messages = await response.json();
        this.scrollToBottom();
    },

    async fetchNewMessages() {
        if (!this.activeChannel) return;

        const lastMessageId = this.messages.length > 0
            ? this.messages[this.messages.length - 1].id
            : 0;

        const response = await fetch(
            `/api/chat/channels/${this.activeChannel.id}/messages?since=${lastMessageId}`
        );
        const newMessages = await response.json();

        if (newMessages.length > 0) {
            this.messages.push(...newMessages);
            this.scrollToBottom();

            // Play sound notification (opcional)
            this.playNotificationSound();
        }
    },

    async sendMessage() {
        if (!this.newMessage.trim()) return;

        await fetch(`/api/chat/channels/${this.activeChannel.id}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            },
            body: JSON.stringify({ message: this.newMessage })
        });

        this.newMessage = '';
        await this.fetchNewMessages(); // Actualizar inmediatamente
    },

    scrollToBottom() {
        this.$nextTick(() => {
            const container = this.$refs.messageContainer;
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        });
    },

    playNotificationSound() {
        // Implementar según preferencias
        const audio = new Audio('/sounds/message.mp3');
        audio.play().catch(() => {});
    }
}));
```

### 3.3 Implementación Backend (Laravel)

```php
// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/chat/channels', [ChatController::class, 'getChannels']);
    Route::get('/chat/channels/{channel}/messages', [ChatController::class, 'getMessages']);
    Route::post('/chat/channels/{channel}/messages', [ChatController::class, 'sendMessage']);
    Route::post('/chat/dm/{pilot}', [ChatController::class, 'sendDirectMessage']);
});

// app/Http/Controllers/ChatController.php
class ChatController extends Controller
{
    public function getChannels(Request $request)
    {
        $pilot = $request->user()->pilot;
        $channels = [];

        // Canal del sistema actual
        if ($pilot->current_system_id) {
            $channels[] = ChatChannel::firstOrCreate([
                'type' => 'system',
                'reference_id' => $pilot->current_system_id
            ], [
                'name' => "Sistema: {$pilot->currentSystem->name}"
            ]);
        }

        // Canal de estación si está atracado
        if ($pilot->current_station_id) {
            $channels[] = ChatChannel::firstOrCreate([
                'type' => 'station',
                'reference_id' => $pilot->current_station_id
            ], [
                'name' => "Estación: {$pilot->currentStation->name}"
            ]);
        }

        // Canal de corporación
        if ($pilot->corporation_id) {
            $channels[] = ChatChannel::firstOrCreate([
                'type' => 'corporation',
                'reference_id' => $pilot->corporation_id
            ], [
                'name' => "Corp: {$pilot->corporation->name}"
            ]);
        }

        // Canal de flota
        if ($pilot->fleet_id) {
            $channels[] = ChatChannel::firstOrCreate([
                'type' => 'fleet',
                'reference_id' => $pilot->fleet_id
            ], [
                'name' => "Flota: #{$pilot->fleet_id}"
            ]);
        }

        // Canales globales
        $channels[] = ChatChannel::firstOrCreate(['type' => 'global', 'name' => 'Ayuda & Novatos']);
        $channels[] = ChatChannel::firstOrCreate(['type' => 'global', 'name' => 'Comercio']);

        return response()->json($channels);
    }

    public function getMessages(Request $request, ChatChannel $channel)
    {
        $sinceId = $request->get('since', 0);

        // Verificar acceso al canal
        if (!$this->canAccessChannel($request->user()->pilot, $channel)) {
            abort(403, 'No tienes acceso a este canal');
        }

        $messages = $channel->messages()
            ->where('id', '>', $sinceId)
            ->with('pilot:id,name')
            ->whereNotIn('pilot_id', function($query) use ($request) {
                // Excluir mensajes de usuarios bloqueados
                $query->select('blocked_pilot_id')
                    ->from('chat_blocks')
                    ->where('pilot_id', $request->user()->pilot->id);
            })
            ->orderBy('created_at', 'asc')
            ->limit(50)
            ->get();

        return response()->json($messages);
    }

    public function sendMessage(Request $request, ChatChannel $channel)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:500'
        ]);

        $pilot = $request->user()->pilot;

        // Verificar acceso
        if (!$this->canAccessChannel($pilot, $channel)) {
            abort(403, 'No tienes acceso a este canal');
        }

        // Anti-spam: Límite de mensajes por minuto
        $recentMessages = ChatMessage::where('pilot_id', $pilot->id)
            ->where('created_at', '>', now()->subMinute())
            ->count();

        if ($recentMessages >= 5) {
            abort(429, 'Demasiados mensajes. Espera un momento.');
        }

        $message = $channel->messages()->create([
            'pilot_id' => $pilot->id,
            'message' => $validated['message']
        ]);

        return response()->json($message->load('pilot:id,name'), 201);
    }

    private function canAccessChannel($pilot, $channel)
    {
        switch ($channel->type) {
            case 'system':
                return $pilot->current_system_id == $channel->reference_id;
            case 'station':
                return $pilot->current_station_id == $channel->reference_id;
            case 'corporation':
                return $pilot->corporation_id == $channel->reference_id;
            case 'fleet':
                return $pilot->fleet_id == $channel->reference_id;
            case 'global':
                return true;
            default:
                return false;
        }
    }
}
```

---

## 4. Interfaz de Usuario (GUI)

### 4.1 Vista Principal del Chat

```
╔═══════════════════════════════════════════════════════════════════════╗
║ 💬 COMUNICACIONES                                                     ║
╠═══════════════════════════════════════════════════════════════════════╣
║ CANALES ACTIVOS:                                                      ║
║ • [Sistema: Vaxav Prime] (12 pilotos) 🔵                             ║
║ • [Estación: Puerto Génesis] (34 pilotos) 🔵                         ║
║ • [Corp: Mineros Unidos] (8 online) 🟢 [3 nuevos]                   ║
║ • Flota: Operación Minera #4 (5 miembros)                           ║
║ • Ayuda & Novatos (248 online)                                       ║
║ • Comercio (892 online)                                              ║
║ • [Amigos] (3 online) 🟢 [1 nuevo mensaje]                          ║
╠═══════════════════════════════════════════════════════════════════════╣
║ CHAT: Sistema: Vaxav Prime                                           ║
╠═══════════════════════════════════════════════════════════════════════╣
║ [14:23] <Marcus Chen> Alguien vendiendo Titanita refinada?          ║
║ [14:25] <Elena Voss> Tengo 500u a 90₡/u, mp                         ║
║ [14:27] <Kai Nakamura> Piratas en cinturón [Rico], cuidado          ║
║ [14:28] <TU> Confirmo, 2 fragatas hostiles en el norte              ║
║ [14:30] <Marcus Chen> Gracias por el aviso                           ║
║                                                                       ║
║ [Escribe tu mensaje aquí...] [ENVIAR]                               ║
╠═══════════════════════════════════════════════════════════════════════╣
║ OPCIONES:                                                             ║
║ [SILENCIAR CANAL] [BLOQUEAR USUARIO] [REPORTAR SPAM]                ║
╚═══════════════════════════════════════════════════════════════════════╝
```

### 4.2 Vista de Mensajes Directos

```
╔═══════════════════════════════════════════════════════════════════════╗
║ 💬 MENSAJE PRIVADO CON: Elena Voss                                   ║
╠═══════════════════════════════════════════════════════════════════════╣
║ [14:25] <Elena Voss> Hola! Vi que buscas Titanita                    ║
║ [14:26] <TU> Sí, necesito 500 unidades                              ║
║ [14:26] <Elena Voss> Perfecto, tengo 500u a 90₡/u                   ║
║ [14:27] <TU> Deal. Estoy en Puerto Génesis, hangar 3                ║
║ [14:27] <Elena Voss> En camino, llego en 2 saltos                    ║
║                                                                       ║
║ [Escribe tu mensaje...] [ENVIAR]                                    ║
╠═══════════════════════════════════════════════════════════════════════╣
║ [VOLVER A CANALES] [BLOQUEAR USUARIO] [VER PERFIL]                  ║
╚═══════════════════════════════════════════════════════════════════════╝
```

---

## 5. Comandos de Chat

### 5.1 Comandos Disponibles

```
/help              - Muestra lista de comandos
/clear             - Limpia tu ventana de chat
/block <nombre>    - Bloquea a un usuario
/unblock <nombre>  - Desbloquea a un usuario
/pm <nombre> <msg> - Envía mensaje privado
/local             - Cambia al chat del sistema actual
/station           - Cambia al chat de estación
/corp              - Cambia al chat de corporación
/fleet             - Cambia al chat de flota
/whoami            - Muestra tu información de piloto
```

### 5.2 Implementación de Comandos

Los comandos se procesan en el frontend antes de enviar al backend:

```javascript
async sendMessage() {
    const msg = this.newMessage.trim();

    // Detectar comandos
    if (msg.startsWith('/')) {
        this.processCommand(msg);
        return;
    }

    // Enviar mensaje normal
    await this.sendNormalMessage(msg);
}

processCommand(cmd) {
    const parts = cmd.split(' ');
    const command = parts[0].toLowerCase();

    switch(command) {
        case '/help':
            this.showHelp();
            break;
        case '/clear':
            this.messages = [];
            break;
        case '/block':
            this.blockUser(parts[1]);
            break;
        case '/pm':
            this.sendPrivateMessage(parts[1], parts.slice(2).join(' '));
            break;
        // ... otros comandos
    }

    this.newMessage = '';
}
```

---

## 6. Sistema Anti-Spam

### 6.1 Límites de Mensajes

```php
// Límite de mensajes por minuto
$recentMessages = ChatMessage::where('pilot_id', $pilot->id)
    ->where('created_at', '>', now()->subMinute())
    ->count();

if ($recentMessages >= 5) {
    abort(429, 'Demasiados mensajes. Espera un momento.');
}
```

### 6.2 Filtro de Palabras Prohibidas

```php
// Lista de palabras prohibidas (configurable)
$bannedWords = ['spam', 'scam', 'hack', ...];

foreach ($bannedWords as $word) {
    if (stripos($validated['message'], $word) !== false) {
        abort(422, 'Mensaje contiene contenido prohibido');
    }
}
```

### 6.3 Auto-Moderación

- Mensajes reportados 3+ veces → Revisión automática
- Usuarios con 5+ reportes → Mute temporal (24 horas)
- Usuarios con 10+ reportes → Ban permanente de chat

---

## 7. Notificaciones

### 7.1 Tipos de Notificaciones

```
🔵 Nuevo mensaje en canal activo (visual)
🟢 Nuevo mensaje privado (sonido + visual)
🔴 Mención de tu nombre en cualquier canal (sonido + alerta)
```

### 7.2 Implementación

```javascript
checkForMentions(message) {
    const pilotName = this.getCurrentPilotName();
    if (message.message.includes(pilotName)) {
        this.showMentionNotification(message);
        this.playUrgentSound();
    }
}
```

---

## 8. Integración con Otros Sistemas

### 8.1 Chat de Flota

Cuando un piloto se une a una flota, automáticamente se suscribe al canal de flota:

```php
// Al unirse a flota
FleetMember::create([
    'fleet_id' => $fleet->id,
    'pilot_id' => $pilot->id
]);

// Auto-suscribir a canal de chat
ChatSubscription::firstOrCreate([
    'pilot_id' => $pilot->id,
    'channel_id' => $fleet->chatChannel->id
]);
```

### 8.2 Chat de Corporación

Al unirse a corporación, suscripción automática:

```php
CorporationMember::create([
    'corporation_id' => $corp->id,
    'pilot_id' => $pilot->id
]);

ChatSubscription::firstOrCreate([
    'pilot_id' => $pilot->id,
    'channel_id' => $corp->chatChannel->id
]);
```

---

## 9. Rendimiento y Optimización

### 9.1 Caché de Mensajes Recientes

```php
// Cachear últimos 50 mensajes por canal
$messages = Cache::remember(
    "chat.channel.{$channelId}.messages",
    now()->addMinutes(5),
    function() use ($channel) {
        return $channel->messages()
            ->with('pilot:id,name')
            ->latest()
            ->limit(50)
            ->get();
    }
);
```

### 9.2 Limpieza de Mensajes Antiguos

```php
// Comando Laravel Scheduler (ejecutar diariamente)
// app/Console/Commands/CleanOldMessages.php

public function handle()
{
    // Eliminar mensajes de canales globales > 7 días
    ChatMessage::whereHas('channel', function($q) {
        $q->where('type', 'global');
    })->where('created_at', '<', now()->subDays(7))
      ->delete();

    // Eliminar mensajes de canales temporales (flota) > 1 día
    ChatMessage::whereHas('channel', function($q) {
        $q->where('type', 'fleet');
    })->where('created_at', '<', now()->subDay())
      ->delete();
}
```

---

## Navegación

- [← Anterior: PRD-Economy.md](./PRD-Economy.md)
- [↑ Volver al Índice](./PRD-Master.md)
- [→ Siguiente: PRD-SocialSystem.md](./PRD-SocialSystem.md)
