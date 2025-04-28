import api from './api';

export interface Pilot {
  id: number;
  name: string;
  race: string;
  credits: number;
  user_id: number;
  corporation_id: number | null;
  location_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePilotData {
  name: string;
  race: string;
}

const pilotService = {
  /**
   * Obtener el piloto del usuario actual
   */
  getCurrentPilot: async () => {
    const response = await api.get('/pilots/current');
    return response.data;
  },

  /**
   * Crear un nuevo piloto
   */
  createPilot: async (data: CreatePilotData) => {
    const response = await api.post('/pilots', data);
    return response.data;
  },

  /**
   * Actualizar un piloto
   */
  updatePilot: async (id: number, data: Partial<Pilot>) => {
    const response = await api.put(`/pilots/${id}`, data);
    return response.data;
  },

  /**
   * Obtener información detallada de un piloto
   */
  getPilotDetails: async (id: number) => {
    const response = await api.get(`/pilots/${id}`);
    return response.data;
  },
};

export default pilotService;
