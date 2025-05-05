<template>
  <div class="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 z-50">
    <div class="w-full flex flex-col items-center space-y-4 sm:items-end">
      <VxvAlert
        v-for="notification in notifications"
        :key="notification.id"
        :variant="notification.type"
        :title="notification.title"
        :message="notification.message"
        :duration="notification.duration"
        :dismissible="true"
        class="w-full max-w-sm pointer-events-auto"
        @dismiss="removeNotification(notification.id)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import VxvAlert from './VxvAlert.vue';
import { useNotificationStore } from '@/stores/notification.ts';

const notificationStore = useNotificationStore();

const notifications = computed(() => {
  return notificationStore.notifications;
});

const removeNotification = (id) => {
  notificationStore.removeNotification(id);
};
</script>
