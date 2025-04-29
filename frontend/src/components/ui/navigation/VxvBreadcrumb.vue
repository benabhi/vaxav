<template>
  <nav class="flex" aria-label="Breadcrumb">
    <ol class="flex items-center space-x-4">
      <!-- Home link (always present) -->
      <li>
        <div>
          <router-link :to="homeLink" class="text-gray-400 hover:text-white">
            <svg class="flex-shrink-0 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
              fill="currentColor" aria-hidden="true">
              <path
                d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span class="sr-only">{{ homeText }}</span>
          </router-link>
        </div>
      </li>
      
      <!-- Dynamic breadcrumb items -->
      <li v-for="(item, index) in items" :key="index">
        <div class="flex items-center">
          <!-- Separator -->
          <svg class="flex-shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="currentColor"
            viewBox="0 0 20 20" aria-hidden="true">
            <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
          </svg>
          
          <!-- Link or text -->
          <router-link 
            v-if="item.to" 
            :to="item.to" 
            class="ml-4 text-sm font-medium text-gray-300 hover:text-white"
          >
            {{ item.text }}
          </router-link>
          <span 
            v-else 
            class="ml-4 text-sm font-medium text-gray-300"
          >
            {{ item.text }}
          </span>
        </div>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
defineProps({
  /**
   * Array of breadcrumb items
   * Each item should have a text property and optionally a to property for the link
   * If to is not provided, the item will be rendered as text
   */
  items: {
    type: Array as () => Array<{ text: string; to?: string }>,
    required: true
  },
  
  /**
   * Link for the home icon
   */
  homeLink: {
    type: String,
    default: '/'
  },
  
  /**
   * Text for the home icon (for screen readers)
   */
  homeText: {
    type: String,
    default: 'Inicio'
  }
});
</script>
