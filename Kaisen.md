# ♾️ Kaizen en TimeTracker — Documentación Completa

> **改善** · *Pequeñas mejoras continuas que suman grandes resultados.*
> Este documento recoge todo lo relacionado con la implementación del método Kaizen en el proyecto TimeTracker Front, tanto a nivel de funcionalidad visible (KaizenHub) como a nivel de arquitectura del código (5S).

---

## 📌 Índice

1. [¿Por qué Kaizen en un TimeTracker?](#1-por-qué-kaizen-en-un-timetracker)
2. [KaizenHub — La nueva pestaña](#2-kaizenhub--la-nueva-pestaña)
   - [🔄 Ciclo PDCA](#21-ciclo-pdca)
   - [🗑️ Muda Detector](#22-muda-detector)
   - [📈 Tendencia +1%](#23-tendencia-1)
   - [🏭 5S Personal (Checklist)](#24-5s-personal-checklist)
3. [5S aplicado al código fuente](#3-5s-aplicado-al-código-fuente)
   - [Seiri — Eliminar](#31-seiri--clasificar-eliminar-lo-innecesario)
   - [Seiton — Ordenar](#32-seiton--ordenar-un-lugar-para-cada-cosa)
   - [Seiso — Limpiar](#33-seiso--limpiar-calidad-en-el-código)
   - [Seiketsu — Estandarizar](#34-seiketsu--estandarizar)
   - [Shitsuke — Disciplina](#35-shitsuke--disciplina-sostenibilidad)
4. [Archivos creados y modificados](#4-archivos-creados-y-modificados)
5. [Persistencia de datos](#5-persistencia-de-datos)

---

## 1. ¿Por qué Kaizen en un TimeTracker?

El método Kaizen nació en la industria manufacturera japonesa, pero su núcleo es universal:

> *"Hoy mejor que ayer, mañana mejor que hoy."*

Un TimeTracker es el candidato ideal porque **ya mide el recurso que Kaizen busca optimizar: el tiempo**. Los datos de actividades del usuario son exactamente el tipo de información que Kaizen utiliza para detectar desperdicios y medir mejoras.

| Principio Kaizen | Aplicación en TimeTracker |
|---|---|
| Mejoras incrementales | Gráfico de tendencia +1% diario |
| Eliminación de desperdicios (Muda) | Detector automático de patrones de desperdicio |
| Ciclo PDCA | Tablero Kanban para gestionar mejoras personales |
| Metodología 5S | Aplicada al código fuente del proyecto |
| Mentalidad de mejora diaria | Checklist 5S diario con historial semanal |

---

## 2. KaizenHub — La nueva pestaña

Se añadió una tercera pestaña al navegador principal con el identificador visual **♾️ Kaizen**, distinguida con color cyan (`#06b6d4`) en lugar del morado de las otras pestañas.

La pestaña contiene 4 módulos en scroll vertical, cada uno mapeando un principio Kaizen.

---

### 2.1 Ciclo PDCA

**Planificar → Hacer → Verificar → Actuar**

Un tablero Kanban de 4 columnas donde el usuario crea tarjetas de mejora personal y las mueve progresivamente por el ciclo.

**Cómo funciona:**
- El usuario pulsa **＋ Nueva mejora** para abrir el formulario inline
- Introduce un título (ej. *"Estudiar 30 min más al día"*), una descripción opcional y una categoría
- La tarjeta se crea en la columna **Planificar**
- Los botones ◀ y ▶ mueven la tarjeta entre fases
- El botón ✕ elimina la tarjeta

**Colores por fase:**
| Fase | Color | Emoji |
|---|---|---|
| Planificar | Morado `#a855f7` | 🎯 |
| Hacer | Cyan `#06b6d4` | ⚡ |
| Verificar | Ámbar `#f59e0b` | 🔍 |
| Actuar | Verde `#10b981` | ✅ |

**Tipos de datos (TypeScript):**
```typescript
type PDCAPhase = 'plan' | 'do' | 'check' | 'act';

interface PDCACard {
  id: string;
  title: string;
  description: string;
  category: string;       // 'STUDY' | 'GYM' | 'REST' | 'GENERAL'
  phase: PDCAPhase;
  createdAt: string;      // 'YYYY-MM-DD'
}
```

---

### 2.2 Muda Detector

Analiza automáticamente las actividades **reales del backend** del usuario logueado y detecta los siguientes desperdicios:

| Desperdicio | Condición | Severidad |
|---|---|---|
| ⏸️ Tiempo muerto | > 10 días sin actividad en el último mes | 🔴 Crítico |
| ⏸️ Tiempo muerto | 5–10 días sin actividad | 🟡 Medio |
| ⚡ Micro-actividades | Más de 3 actividades < 10 minutos | 🟡 Medio |
| 🔥 Racha rota | Sin días consecutivos activos | 🔴 Crítico |
| ⚖️ Desbalance | Solo se usa 1 categoría | 🟢 OK/Bajo |
| ✅ Sin desperdicios | Ningún patrón negativo detectado | 🟢 OK |

> [!NOTE]
> El análisis se basa en los últimos 30 días de actividades del usuario. Si el backend no está disponible, el detector muestra "Analizando actividades..." indefinidamente.

---

### 2.3 Tendencia +1%

Un gráfico **sparkline SVG** de los últimos 30 días que muestra la curva de puntos de impacto acumulados por día.

**Métricas calculadas:**
- **Promedio últimos 7 días** vs **7 días anteriores** — determina si la tendencia es positiva ↗ o negativa ↘
- El color del gráfico cambia: verde `#10b981` si mejora, rojo `#f43f5e` si baja
- Un mensaje de veredicto Kaizen al pie del gráfico

**Lógica del sparkline:**
```typescript
const getSparkline = (data: { date: string; points: number }[]) => {
  const max = Math.max(...data.map(d => d.points), 1);
  // Normaliza los puntos a coordenadas SVG (viewBox 0 0 100 42)
  const pts = data.map((d, i) =>
    `${(i / (data.length - 1)) * 100},${40 - (d.points / max) * 40}`
  ).join(' ');
  const avg7first = data.slice(0, 7).reduce((s, d) => s + d.points, 0) / 7;
  const avg7last  = data.slice(-7).reduce((s, d)  => s + d.points, 0) / 7;
  return { pts, improving: avg7last >= avg7first, ... };
};
```

---

### 2.4 5S Personal (Checklist)

Un checklist diario con las 5S japonesas **adaptadas al contexto personal** del portátil:

| S | Nombre | Pregunta diaria |
|---|---|---|
| 🗂️ Seiri | Clasificar | ¿Eliminaste distracciones hoy? |
| 📐 Seiton | Ordenar | ¿Tenías tus herramientas listas? |
| ✨ Seiso | Limpiar | ¿Terminaste lo que empezaste? |
| 🔄 Seiketsu | Estandarizar | ¿Seguiste tu rutina? |
| 💪 Shitsuke | Disciplina | ¿Cumpliste tus metas del día? |

- Cada ítem es un botón toggle — se ilumina en cyan al marcarlo
- El **score de hoy** se muestra como 5 puntos luminosos y un contador `X/5`
- Al final aparece el **historial de los últimos 7 días** con score visual por día (🟢 ≥4, 🟡 ≥2, 🔴 <2)
- Todo se guarda en `localStorage`

**Interface:**
```typescript
interface FiveSEntry {
  date: string;       // 'YYYY-MM-DD'
  seiri: boolean;
  seiton: boolean;
  seiso: boolean;
  seiketsu: boolean;
  shitsuke: boolean;
}
```

---

## 3. 5S aplicado al código fuente

La segunda parte de la implementación aplica el mismo método directamente sobre la base de código.

---

### 3.1 Seiri — Clasificar (Eliminar lo innecesario)

Se identificaron y eliminaron los siguientes **archivos muertos**:

#### ❌ `src/App.css` — ELIMINADO
Era el archivo de estilos del **template inicial de Vite**. Contenía 185 líneas con clases como `.hero`, `.counter`, `.ticks` que nunca fueron importadas ni utilizadas en el proyecto.

```diff
- import './App.css'   // Esta línea no existía — nunca se importó
```

#### ❌ `src/components/UserManagement.tsx` — ELIMINADO
Componente de 142 líneas con estilo **light mode** (fondo blanco, texto gris) que nunca fue importado ni montado en ningún componente padre. Era un vestigio de la versión anterior del proyecto.

```diff
- // Componente completo eliminado — bg-white, text-gray-800, border-gray-300
- // Nunca apareció en App.tsx ni en ningún otro componente
```

#### ❌ Interfaces `Activity` y `User` duplicadas — ELIMINADAS
La interfaz `Activity` estaba **definida localmente en 3 archivos** distintos con campos ligeramente diferentes. La interfaz `User` estaba duplicada en `UserSelect.tsx` y `UserManagement.tsx`.

```diff
- // En ActivityManagement.tsx
- interface Activity { id: string; nameActivity: string; ... }

- // En Dashboard.tsx
- interface Activity { userId: string; dateActivity: string; ... }

- // En UserManagement.tsx (archivo eliminado)
- interface User { id: string; name: string; email: string; }
```

---

### 3.2 Seiton — Ordenar (Un lugar para cada cosa)

Se crearon dos nuevas carpetas que establecen la estructura canónica del proyecto:

#### ✅ `src/types/index.ts` — NUEVO
Fuente única de verdad para todos los tipos compartidos:

```typescript
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
```

#### ✅ `src/constants/categories.ts` — NUEVO
`CATEGORY_META` estaba duplicado en `ActivityManagement.tsx` y `Dashboard.tsx` con nombres distintos. Se centralizó con helpers reutilizables:

```typescript
export const CATEGORY_META: Record<string, CategoryMeta> = {
  STUDY: { label: 'Estudio',  emoji: '📚', badgeClass: 'badge-study', color: '#a855f7' },
  GYM:   { label: 'Gym',      emoji: '🏋️', badgeClass: 'badge-gym',   color: '#06b6d4' },
  REST:  { label: 'Descanso', emoji: '🌙', badgeClass: 'badge-rest',  color: '#10b981' },
};

// Helpers con fallback para categorías desconocidas
export const getCategoryEmoji = (category: string): string =>
  CATEGORY_META[category]?.emoji ?? '📌';

export const getCategoryColor = (category: string): string =>
  CATEGORY_META[category]?.color ?? '#94a3b8';
```

**Estructura final de `src/`:**
```
src/
├── types/
│   └── index.ts              ← ✨ Tipos globales (User, Activity)
├── constants/
│   └── categories.ts         ← ✨ Metadatos de categorías
├── services/
│   └── api.ts                ← Cliente HTTP limpio
├── components/
│   ├── ActivityManagement.tsx
│   ├── Dashboard.tsx
│   ├── KaizenHub.tsx         ← ✨ Módulo Kaizen nuevo
│   └── UserSelect.tsx
├── App.tsx
├── index.css
└── main.tsx
```

---

### 3.3 Seiso — Limpiar (Calidad en el código)

#### `src/services/api.ts`

```diff
- //const BASE_URL = 'http://157.137.222.93:8080/timeTracker/api/v1';
- const BASE_URL = 'http://localhost:8080/timeTracker/api/v1';
- ...
- if (!res.ok) throw new Error('Error fetching users');

+ const BASE_URL = 'http://localhost:8080/timeTracker/api/v1';
+ // 🚀 Producción: const BASE_URL = 'http://157.137.222.93:8080/...';
+ ...
+ if (!res.ok) throw new Error('Error al obtener usuarios');  // Español consistente
```

- URL de producción convertida en comentario con etiqueta `🚀 Producción:` para cambio inmediato
- Mensajes de error traducidos al español para consistencia con el resto de la UI
- Separadores de sección `// ── USUARIOS ──` y `// ── ACTIVIDADES ──`

#### Cabeceras de archivo
Todos los componentes recibieron un bloque de documentación estandarizado:
```typescript
// =============================================================================
// components/KaizenHub.tsx — Módulo de mejora continua basado en Kaizen
// Incluye: tablero PDCA, detector Muda, tendencia +1% y checklist 5S.
// Estado persistido en localStorage bajo clave `kaizen_{userId}`.
// =============================================================================
```

---

### 3.4 Seiketsu — Estandarizar

**Patrón de imports estandarizado** en todos los componentes:

```typescript
// ① Librerías externas
import { useState, useEffect } from 'react';

// ② Servicios internos
import { api } from '../services/api';

// ③ Constantes compartidas
import { CATEGORY_META, getCategoryColor } from '../constants/categories';

// ④ Tipos compartidos
import type { User, Activity } from '../types';
```

`UserSelect` mantiene backward compatibility re-exportando `User`:
```typescript
// Así App.tsx no necesita cambiar su import path existente
export type { User } from '../types';
```

---

### 3.5 Shitsuke — Disciplina (Sostenibilidad)

La nueva estructura establece las reglas implícitas para futuras contribuciones:

> [!IMPORTANT]
> **Regla de oro:** Si añades un tipo compartido entre dos o más componentes → va en `src/types/index.ts`. Si añades constantes visuales de una categoría → van en `src/constants/categories.ts`.

| Acción futura | Dónde hacerlo |
|---|---|
| Añadir nueva categoría (ej. `WORK`) | `src/constants/categories.ts` → `CATEGORY_META` |
| Añadir nuevo campo a Activity | `src/types/index.ts` → interfaz `Activity` |
| Añadir nueva URL de API | `src/services/api.ts` → sección correspondiente |
| Añadir nuevo módulo Kaizen | `src/components/KaizenHub.tsx` → nueva `<section>` |

---

## 4. Archivos creados y modificados

| Archivo | Operación | Motivo |
|---|---|---|
| `src/types/index.ts` | ✨ Creado | Centralizar tipos `User` y `Activity` |
| `src/constants/categories.ts` | ✨ Creado | Centralizar metadatos de categorías |
| `src/components/KaizenHub.tsx` | ✨ Creado | Módulo Kaizen completo (4 secciones) |
| `src/App.tsx` | 🔧 Modificado | Añadir pestaña Kaizen al nav y routing |
| `src/index.css` | 🔧 Modificado | Añadir `.kaizen-card` y `@keyframes pulse-ring` |
| `src/services/api.ts` | 🔧 Modificado | Limpieza de comentarios y mensajes |
| `src/components/ActivityManagement.tsx` | 🔧 Modificado | Importar de `types/` y `constants/` |
| `src/components/Dashboard.tsx` | 🔧 Modificado | Importar de `types/` y `constants/` |
| `src/components/UserSelect.tsx` | 🔧 Modificado | Re-exportar `User` desde `types/` |
| `src/App.css` | 🗑️ Eliminado | Nunca importado — template de Vite |
| `src/components/UserManagement.tsx` | 🗑️ Eliminado | Nunca usado — código muerto |

---

## 5. Persistencia de datos

El KaizenHub no requiere cambios en el backend. Toda la data Kaizen se persiste en `localStorage` del navegador bajo una clave por usuario:

```
localStorage['kaizen_<userId>'] = {
  cards: PDCACard[],          // Tarjetas del tablero PDCA
  fiveSHistory: FiveSEntry[]  // Historial del checklist 5S (por fecha)
}
```

Los datos de actividades (para Muda Detector y Tendencia +1%) se obtienen del backend con la API existente — sin endpoints nuevos.

> [!TIP]
> Si quieres resetear tu KaizenHub, abre la consola del navegador y ejecuta:
> ```javascript
> localStorage.removeItem('kaizen_<tu-userId-aqui>');
> ```
