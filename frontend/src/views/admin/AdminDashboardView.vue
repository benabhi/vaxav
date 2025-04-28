<template>
  <AdminLayout title="Dashboard">
    <template #breadcrumbs>
      <nav class="flex" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-4">
          <li>
            <div>
              <router-link to="/admin" class="text-gray-400 hover:text-white">
                <svg class="flex-shrink-0 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                  fill="currentColor" aria-hidden="true">
                  <path
                    d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span class="sr-only">Inicio</span>
              </router-link>
            </div>
          </li>
          <li>
            <div class="flex items-center">
              <svg class="flex-shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                viewBox="0 0 20 20" aria-hidden="true">
                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
              </svg>
              <span class="ml-4 text-sm font-medium text-gray-300">Dashboard</span>
            </div>
          </li>
        </ol>
      </nav>
    </template>

    <div class="py-6">
      <h1 class="text-2xl font-semibold text-white">Dashboard</h1>

      <!-- Stats cards -->
      <div class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Users stat -->
        <div class="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-300 truncate">Usuarios Totales</dt>
                  <dd>
                    <div class="text-lg font-medium text-white">{{ stats.users }}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-700 px-5 py-3">
            <div class="text-sm">
              <router-link to="/admin/users" class="font-medium text-blue-400 hover:text-blue-300">Ver
                todos</router-link>
            </div>
          </div>
        </div>

        <!-- Pilots stat -->
        <div class="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-300 truncate">Pilotos Activos</dt>
                  <dd>
                    <div class="text-lg font-medium text-white">{{ stats.pilots }}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-700 px-5 py-3">
            <div class="text-sm">
              <router-link to="/admin/pilots" class="font-medium text-blue-400 hover:text-blue-300">Ver
                todos</router-link>
            </div>
          </div>
        </div>

        <!-- Ships stat -->
        <div class="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-300 truncate">Naves Registradas</dt>
                  <dd>
                    <div class="text-lg font-medium text-white">{{ stats.ships }}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-700 px-5 py-3">
            <div class="text-sm">
              <router-link to="/admin/ships" class="font-medium text-blue-400 hover:text-blue-300">Ver
                todas</router-link>
            </div>
          </div>
        </div>

        <!-- Corporations stat -->
        <div class="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-300 truncate">Corporaciones</dt>
                  <dd>
                    <div class="text-lg font-medium text-white">{{ stats.corporations }}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-700 px-5 py-3">
            <div class="text-sm">
              <router-link to="/admin/corporations" class="font-medium text-blue-400 hover:text-blue-300">Ver
                todas</router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent activity -->
      <div class="mt-8">
        <h2 class="text-lg font-medium text-white">Actividad Reciente</h2>

        <div class="mt-4 bg-gray-800 shadow overflow-hidden sm:rounded-md border border-gray-700">
          <ul class="divide-y divide-gray-700">
            <li v-for="(activity, index) in recentActivity" :key="index">
              <div class="px-4 py-4 sm:px-6">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-blue-400 truncate">{{ activity.title }}</p>
                  <div class="ml-2 flex-shrink-0 flex">
                    <p class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="activityTypeClasses[activity.type]">
                      {{ activity.type }}
                    </p>
                  </div>
                </div>
                <div class="mt-2 sm:flex sm:justify-between">
                  <div class="sm:flex">
                    <p class="flex items-center text-sm text-gray-300">
                      <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clip-rule="evenodd" />
                      </svg>
                      {{ activity.user }}
                    </p>
                  </div>
                  <div class="mt-2 flex items-center text-sm text-gray-300 sm:mt-0">
                    <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clip-rule="evenodd" />
                    </svg>
                    <p>
                      {{ activity.date }}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';

// Mock data for dashboard stats
const stats = ref({
  users: 0,
  pilots: 0,
  ships: 0,
  corporations: 0
});

// Mock data for recent activity
const recentActivity = ref([
  {
    title: 'Nuevo usuario registrado',
    type: 'usuario',
    user: 'Sistema',
    date: '20 minutos atrás'
  },
  {
    title: 'Nuevo piloto creado',
    type: 'piloto',
    user: 'John Doe',
    date: '1 hora atrás'
  },
  {
    title: 'Nave comprada',
    type: 'nave',
    user: 'Jane Smith',
    date: '3 horas atrás'
  },
  {
    title: 'Nueva corporación fundada',
    type: 'corporación',
    user: 'Alex Johnson',
    date: '1 día atrás'
  },
  {
    title: 'Transacción en el mercado',
    type: 'mercado',
    user: 'Sam Wilson',
    date: '2 días atrás'
  }
]);

// Activity type classes for badges
const activityTypeClasses = {
  usuario: 'bg-blue-100 text-blue-800',
  piloto: 'bg-green-100 text-green-800',
  nave: 'bg-yellow-100 text-yellow-800',
  corporación: 'bg-purple-100 text-purple-800',
  mercado: 'bg-indigo-100 text-indigo-800'
};

// Fetch dashboard data
onMounted(async () => {
  // Simulate API call
  setTimeout(() => {
    stats.value = {
      users: 125,
      pilots: 98,
      ships: 342,
      corporations: 15
    };
  }, 500);
});
</script>
