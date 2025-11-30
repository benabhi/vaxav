import './bootstrap';
import Alpine from 'alpinejs';

// Initialize Alpine.js
window.Alpine = Alpine;
Alpine.start();

// Global utilities
window.formatNumber = (num) => {
    return new Intl.NumberFormat('es-ES').format(num);
};

window.formatCredits = (credits) => {
    return new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(credits) + ' CR';
};

window.formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Game tick countdown
window.tickCountdown = () => {
    return {
        timeLeft: 0,
        interval: null,
        init() {
            this.startCountdown();
        },
        startCountdown() {
            // This would be fetched from the server
            const tickDuration = 10 * 60; // 10 minutes in seconds
            this.timeLeft = tickDuration;

            this.interval = setInterval(() => {
                this.timeLeft--;
                if (this.timeLeft <= 0) {
                    this.timeLeft = tickDuration;
                    // Trigger tick event
                    window.dispatchEvent(new CustomEvent('game-tick'));
                }
            }, 1000);
        },
        formatTime() {
            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    };
};

// Listen for game tick events
window.addEventListener('game-tick', () => {
    console.log('Game tick occurred!');
    // Refresh relevant game data
});

console.log('Vaxav initialized 🚀');
