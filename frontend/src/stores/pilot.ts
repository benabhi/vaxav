import { defineStore } from 'pinia';
import pilotService from '@/services/pilotService';
import type { Pilot, CreatePilotData } from '@/services/pilotService';

interface PilotState {
  currentPilot: Pilot | null;
  loading: boolean;
  error: string | null;
}

export const usePilotStore = defineStore('pilot', {
  state: (): PilotState => ({
    currentPilot: null,
    loading: false,
    error: null,
  }),

  getters: {
    hasPilot: (state) => !!state.currentPilot,
    pilotName: (state) => state.currentPilot?.name || '',
    pilotRace: (state) => state.currentPilot?.race || '',
    pilotCredits: (state) => state.currentPilot?.credits || 0,
  },

  actions: {
    async fetchCurrentPilot() {
      this.loading = true;
      this.error = null;

      try {
        const pilot = await pilotService.getCurrentPilot();
        this.currentPilot = pilot;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al obtener el piloto';
        this.currentPilot = null;
      } finally {
        this.loading = false;
      }
    },

    async createPilot(data: CreatePilotData) {
      this.loading = true;
      this.error = null;

      try {
        const pilot = await pilotService.createPilot(data);
        this.currentPilot = pilot;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al crear el piloto';
      } finally {
        this.loading = false;
      }
    },

    async updatePilot(data: Partial<Pilot>) {
      if (!this.currentPilot) {
        this.error = 'No hay piloto para actualizar';
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        const updatedPilot = await pilotService.updatePilot(this.currentPilot.id, data);
        this.currentPilot = updatedPilot;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al actualizar el piloto';
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    },
  },
});
