//const BASE_URL = 'http://157.137.222.93:8080/timeTracker/api/v1';
const BASE_URL = 'http://localhost:8080/timeTracker/api/v1';

export const api = {
  // --- USERS ---
  getUsers: async () => {
    const res = await fetch(`${BASE_URL}/users`);
    if (!res.ok) throw new Error('Error fetching users');
    return res.json();
  },
  getUserById: async (id: string) => {
    const res = await fetch(`${BASE_URL}/users/${id}`);
    if (!res.ok) throw new Error('Error fetching user');
    return res.json();
  },
  createUser: async (userData: { name: string; email: string }) => {
    const res = await fetch(`${BASE_URL}/users/create-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error('Error creating user');
    return res.json();
  },
  updateUser: async (id: string, userData: { name: string; email: string }) => {
    const res = await fetch(`${BASE_URL}/users/${id}/update-user`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error('Error updating user');
    // PUT usually returns NO_CONTENT (204)
    return res.status === 204 ? null : res.json();
  },
  deleteUser: async (id: string) => {
    const res = await fetch(`${BASE_URL}/users/${id}/delete-user`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error deleting user');
  },

  // --- ACTIVITIES ---
  getActivities: async () => {
    const res = await fetch(`${BASE_URL}/activities`);
    if (!res.ok) throw new Error('Error fetching activities');
    return res.json();
  },
  getActivityById: async (id: string) => {
    const res = await fetch(`${BASE_URL}/activities/${id}`);
    if (!res.ok) throw new Error('Error fetching activity');
    return res.json();
  },
  getActivitiesByCategory: async (category: string) => {
    const res = await fetch(`${BASE_URL}/activities/categories?category=${category}`);
    if (!res.ok) throw new Error('Error fetching activities by category');
    return res.json();
  },
  getActivitiesByDate: async (date: string) => {
    const res = await fetch(`${BASE_URL}/activities/activities-date?date=${date}`);
    if (!res.ok) throw new Error('Error fetching activities by date');
    return res.json();
  },
  getDailyPoints: async (date: string) => {
    const res = await fetch(`${BASE_URL}/activities/points?date=${date}`);
    if (!res.ok) throw new Error('Error fetching daily points');
    return res.json(); // Integer
  },
  getDailyVerdict: async (date: string) => {
    const res = await fetch(`${BASE_URL}/activities/daily-verdict?date=${date}`);
    if (!res.ok) throw new Error('Error fetching daily verdict');
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
    if (!res.ok) throw new Error('Error creating activity');
    return res.json();
  },
  updateActivity: async (
    id: string,
    activityData: {
      nameActivity: string;
      durationActivity: number;
      dateActivity: string;
      categoryActivity: string;
      userId: string;
    }
  ) => {
    const res = await fetch(`${BASE_URL}/activities/${id}/update-activity`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activityData),
    });
    if (!res.ok) throw new Error('Error updating activity');
    return res.status === 204 ? null : res.json();
  },
  deleteActivity: async (id: string) => {
    const res = await fetch(`${BASE_URL}/activities/${id}/delete-activity`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error deleting activity');
  },
};
