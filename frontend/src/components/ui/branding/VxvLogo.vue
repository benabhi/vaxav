<template>
  <RouterLink :to="to" class="block">
    <h1 
      :class="[
        'font-bold neon-logo',
        sizeClasses[size]
      ]"
    >
      VAXAV
    </h1>
  </RouterLink>
</template>

<script setup>
import { RouterLink } from 'vue-router';

const props = defineProps({
  to: {
    type: String,
    default: '/'
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  }
});

const sizeClasses = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl'
};
</script>

<style scoped>
@keyframes neonPulse {
  0% {
    text-shadow: 
      0 0 5px rgba(59, 130, 246, 0.5),
      0 0 10px rgba(59, 130, 246, 0.5),
      0 0 15px rgba(59, 130, 246, 0.5);
  }
  50% {
    text-shadow: 
      0 0 5px rgba(59, 130, 246, 0.6),
      0 0 10px rgba(59, 130, 246, 0.6),
      0 0 15px rgba(59, 130, 246, 0.6),
      0 0 20px rgba(59, 130, 246, 0.4);
  }
  100% {
    text-shadow: 
      0 0 5px rgba(59, 130, 246, 0.5),
      0 0 10px rgba(59, 130, 246, 0.5),
      0 0 15px rgba(59, 130, 246, 0.5);
  }
}

@keyframes neonFlicker {
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
    color: #60a5fa;
    text-shadow: 
      0 0 5px rgba(96, 165, 250, 0.8),
      0 0 10px rgba(96, 165, 250, 0.8),
      0 0 15px rgba(96, 165, 250, 0.8),
      0 0 20px rgba(96, 165, 250, 0.8),
      0 0 30px rgba(96, 165, 250, 0.6),
      0 0 40px rgba(96, 165, 250, 0.4);
  }
  20%, 24%, 55% {
    color: #1e40af;
    text-shadow: none;
  }
}

.neon-logo {
  color: #3b82f6; /* Azul base (blue-500) */
  text-shadow:
    0 0 5px rgba(59, 130, 246, 0.5),
    0 0 10px rgba(59, 130, 246, 0.5),
    0 0 15px rgba(59, 130, 246, 0.5);
  transition: all 0.3s ease;
  letter-spacing: 2px;
  font-family: 'Orbitron', 'Rajdhani', 'Audiowide', sans-serif;
  animation: neonPulse 2s infinite;
  -webkit-text-stroke: 0.5px rgba(96, 165, 250, 0.5);
}

.neon-logo:hover {
  color: #60a5fa; /* Azul más claro (blue-400) */
  text-shadow: 
    0 0 5px rgba(96, 165, 250, 0.8),
    0 0 10px rgba(96, 165, 250, 0.8),
    0 0 15px rgba(96, 165, 250, 0.8),
    0 0 20px rgba(96, 165, 250, 0.8),
    0 0 30px rgba(96, 165, 250, 0.6),
    0 0 40px rgba(96, 165, 250, 0.4);
  transform: scale(1.05);
  animation: neonFlicker 1.5s forwards;
  -webkit-text-stroke: 1px rgba(96, 165, 250, 0.8);
}
</style>
