// =============================================================================
// services/api.ts — Cliente HTTP para el backend TimeTracker
// Base URL: cambiar entre localhost y producción según el entorno.
// =============================================================================

const BASE_URL = 'http://localhost:8080/timeTracker/api/v1';
// 🚀 Producción: const BASE_URL = 'http://157.137.222.93:8080/timeTracker/api/v1';

export const api = {

  // ── USUARIOS ──────────────────────────────────────────────────────────────

  getUsers: async () => {
    const res = await fetch(`${BASE_URL}/users`);
    if (!res.ok) throw new Error('Error al obtener usuarios');
    return res.json();
  },

  getUserById: async (id: string) => {
    const res = await fetch(`${BASE_URL}/users/${id}`);
    if (!res.ok) throw new Error('Error al obtener usuario');
    return res.json();
  },

  createUser: async (userData: { name: string; email: string }) => {
    const res = await fetch(`${BASE_URL}/users/create-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error('Error al crear usuario');
    return res.json();
  },

  updateUser: async (id: string, userData: { name: string; email: string }) => {
    const res = await fetch(`${BASE_URL}/users/${id}/update-user`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error('Error al actualizar usuario');
    return res.status === 204 ? null : res.json();
  },

  deleteUser: async (id: string) => {
    const res = await fetch(`${BASE_URL}/users/${id}/delete-user`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar usuario');
  },

  // ── ACTIVIDADES ───────────────────────────────────────────────────────────

  getActivities: async () => {
    const res = await fetch(`${BASE_URL}/activities`);
    if (!res.ok) throw new Error('Error al obtener actividades');
    return res.json();
  },

  getActivityById: async (id: string) => {
    const res = await fetch(`${BASE_URL}/activities/${id}`);
    if (!res.ok) throw new Error('Error al obtener actividad');
    return res.json();
  },

  getActivitiesByCategory: async (category: string) => {
    const res = await fetch(`${BASE_URL}/activities/categories?category=${category}`);
    if (!res.ok) throw new Error('Error al obtener actividades por categoría');
    return res.json();
  },

  getActivitiesByDate: async (date: string) => {
    const res = await fetch(`${BASE_URL}/activities/activities-date?date=${date}`);
    if (!res.ok) throw new Error('Error al obtener actividades por fecha');
    return res.json();
  },

  getDailyPoints: async (date: string) => {
    const res = await fetch(`${BASE_URL}/activities/points?date=${date}`);
    if (!res.ok) throw new Error('Error al obtener puntos del día');
    return res.json(); // Integer
  },

  getDailyVerdict: async (date: string) => {
    const res = await fetch(`${BASE_URL}/activities/daily-verdict?date=${date}`);
    if (!res.ok) throw new Error('Error al obtener veredicto del día');
    return res.text(); // String
  },

  createActivity: async (activityData: {
    nameActivity: string;
    durationActivity: number;
    dateActivity: string;
    categoryActivity: string;
    userId: string;
  }) => {
    const res = await fetch(`${BASE_URL}/activities/create-activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activityData),
    });
    if (!res.ok) throw new Error('Error al crear actividad');
    return res.json();
  },

  updateActivity: async (id: string, activityData: {
    nameActivity: string;
    durationActivity: number;
    dateActivity: string;
    categoryActivity: string;
    userId: string;
  }) => {
    const res = await fetch(`${BASE_URL}/activities/${id}/update-activity`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activityData),
    });
    if (!res.ok) throw new Error('Error al actualizar actividad');
    return res.status === 204 ? null : res.json();
  },

  deleteActivity: async (id: string) => {
    const res = await fetch(`${BASE_URL}/activities/${id}/delete-activity`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar actividad');
  },
};
