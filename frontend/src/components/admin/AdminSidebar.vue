<template>
  <div class="h-full flex flex-col bg-gray-800 border-r border-gray-700">
    <!-- Header -->
    <div class="flex items-center justify-between h-16 flex-shrink-0 px-4 border-b border-gray-700">
      <slot name="header">
        <div class="flex items-center">
          <span class="text-xl font-bold text-white">Vaxav</span>
          <h1 v-if="!collapsed" class="ml-2 text-xl font-semibold text-white">Admin</h1>
        </div>
      </slot>

      <button v-if="!collapsed" type="button" class="text-gray-300 hover:text-white" @click="$emit('toggle-collapse')">
        <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>

      <button v-else type="button" class="text-gray-300 hover:text-white" @click="$emit('toggle-collapse')">
        <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-2 py-4 overflow-y-auto">
      <slot name="navigation">
        <ul class="space-y-1">
          <li v-for="item in items" :key="item.id">
            <!-- Menu item with router-link -->
            <router-link v-if="item.to && !item.children" :to="item.to" :class="[
              isActive(item) ? 'bg-gray-700 text-blue-400' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
            ]" @click="$emit('select', item.id)">
              <div v-if="item.icon" class="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500">
                <!-- Icon component would go here -->
                <component :is="item.icon" v-if="typeof item.icon === 'object'" />
                <span v-else class="material-icons">{{ item.icon }}</span>
              </div>
              <span v-if="!collapsed">{{ item.label }}</span>
            </router-link>

            <!-- Menu item with href -->
            <a v-else-if="item.href && !item.children" :href="item.href" :class="[
              isActive(item) ? 'bg-gray-700 text-blue-400' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
            ]" @click="$emit('select', item.id)">
              <div v-if="item.icon" class="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500">
                <!-- Icon component would go here -->
                <component :is="item.icon" v-if="typeof item.icon === 'object'" />
                <span v-else class="material-icons">{{ item.icon }}</span>
              </div>
              <span v-if="!collapsed">{{ item.label }}</span>
            </a>

            <!-- Menu item with children (dropdown) -->
            <div v-else>
              <button type="button" :class="[
                hasActiveChild(item) ? 'bg-gray-700 text-blue-400' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                'group w-full flex items-center px-2 py-2 text-sm font-medium rounded-md'
              ]" @click="toggleDropdown(item.id)">
                <div v-if="item.icon" class="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500">
                  <!-- Icon component would go here -->
                  <component :is="item.icon" v-if="typeof item.icon === 'object'" />
                  <span v-else class="material-icons">{{ item.icon }}</span>
                </div>
                <span v-if="!collapsed" class="flex-1">{{ item.label }}</span>
                <svg v-if="!collapsed"
                  :class="[openDropdowns.includes(item.id) ? 'text-gray-400 rotate-90' : 'text-gray-300', 'ml-3 flex-shrink-0 h-5 w-5 transform group-hover:text-gray-400 transition-colors ease-in-out duration-150']"
                  viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M6 6L14 10L6 14V6Z" fill="currentColor" />
                </svg>
              </button>

              <!-- Dropdown menu -->
              <div v-if="openDropdowns.includes(item.id) && !collapsed" class="space-y-1 pl-10 mt-1">
                <router-link v-for="child in item.children" :key="child.id" :to="child.to || ''" :class="[
                  isActive(child) ? 'bg-gray-700 text-blue-400' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                ]" @click="$emit('select', child.id)">
                  {{ child.label }}
                </router-link>
              </div>
            </div>
          </li>
        </ul>
      </slot>
    </nav>

    <!-- No footer -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  collapsed: {
    type: Boolean,
    default: false
  },
  activeItem: {
    type: String,
    default: ''
  }
});

defineEmits(['toggle-collapse', 'select']);

const route = useRoute();
const openDropdowns = ref<string[]>([]);

// Toggle dropdown state
const toggleDropdown = (id: string) => {
  if (openDropdowns.value.includes(id)) {
    openDropdowns.value = openDropdowns.value.filter(item => item !== id);
  } else {
    openDropdowns.value.push(id);
  }
};

// Check if an item is active
const isActive = (item: any) => {
  if (props.activeItem) {
    return item.id === props.activeItem;
  }

  if (item.to && route.path) {
    return route.path === item.to || route.path.startsWith(`${item.to}/`);
  }

  return false;
};

// Check if an item has an active child
const hasActiveChild = (item: any) => {
  if (!item.children) return false;

  return item.children.some((child: any) => isActive(child));
};
</script>
