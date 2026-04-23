// =============================================================================
// types/index.ts — Tipos globales compartidos de la aplicación
// Centraliza todas las interfaces para evitar duplicación entre componentes.
// =============================================================================

/** Usuario autenticado en la aplicación */
export interface User {
  id: string;
  name: string;
  email: string;
}

/** Actividad registrada por un usuario */
export interface Activity {
  id: string;
  nameActivity: string;
  durationActivity: number;
  dateActivity: string;
  categoryActivity: string;
  userId: string;
  impactPoints?: number;
}
