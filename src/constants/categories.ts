// =============================================================================
// constants/categories.ts — Metadatos de categorías de actividad
// Fuente única de verdad para colores, etiquetas e iconos de categoría.
// Elimina la duplicación entre ActivityManagement.tsx y Dashboard.tsx.
// =============================================================================

export interface CategoryMeta {
  label: string;
  emoji: string;
  badgeClass: string;
  color: string;
}

/** Metadatos visuales por categoría (badge, color, emoji, etiqueta) */
export const CATEGORY_META: Record<string, CategoryMeta> = {
  STUDY: { label: 'Estudio',   emoji: '📚', badgeClass: 'badge-study', color: '#a855f7' },
  GYM:   { label: 'Gym',       emoji: '🏋️', badgeClass: 'badge-gym',   color: '#06b6d4' },
  REST:  { label: 'Descanso',  emoji: '🌙', badgeClass: 'badge-rest',  color: '#10b981' },
};

/** Devuelve el emoji de una categoría, con fallback a 📌 */
export const getCategoryEmoji = (category: string): string =>
  CATEGORY_META[category]?.emoji ?? '📌';

/** Devuelve el color hex de una categoría, con fallback a gris */
export const getCategoryColor = (category: string): string =>
  CATEGORY_META[category]?.color ?? '#94a3b8';
