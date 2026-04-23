# ⏱️ TimeTracker — Frontend

Interfaz gráfica para el sistema de seguimiento de productividad **TimeTracker**, construida con **React**, **TypeScript** y **Tailwind CSS v4**.

---

## 🎨 Diseño

La interfaz cuenta con un diseño premium en modo oscuro con:

- **Glassmorphism** — tarjetas con efecto de vidrio esmerilado
- **Aurora background** — blobs animados de color como fondo ambiental
- **Gradientes de neón** — paleta vibrante en púrpura y cian
- **Micro-animaciones** — transiciones suaves en todos los elementos interactivos
- **Tipografía Inter** — desde Google Fonts, con pesos optimizados

---

## 🧩 Funcionalidades

| Módulo | Descripción |
|---|---|
| **Selección de Usuario** | Pantalla de inicio donde el usuario elige su perfil o crea uno nuevo. No requiere autenticación. |
| **Actividades** | Registro, visualización y eliminación de actividades personales. Las actividades se filtran automáticamente por el usuario activo. Incluye tarjetas de estadísticas (total actividades, minutos y puntos). |
| **Dashboard** | Consulta por fecha con resumen de puntos, veredicto del día (`Día flojo`, `Día equilibrado`, `Alto rendimiento`) y desglose por categoría con barras de progreso. |

---

## 🗂️ Estructura del proyecto

```
src/
├── components/
│   ├── UserSelect.tsx          # Pantalla de inicio / selección de perfil
│   ├── ActivityManagement.tsx  # Gestión de actividades del usuario
│   └── Dashboard.tsx           # Dashboard diario por fecha
├── services/
│   └── api.ts                  # Todas las llamadas al backend (fetch)
├── App.tsx                     # Contenedor principal con navegación
├── main.tsx                    # Entry point de React
└── index.css                   # Sistema de diseño: tokens, keyframes, clases utilitarias
```

---

## 🛠️ Stack Tecnológico

- **React 19** con hooks (`useState`, `useEffect`)
- **TypeScript** para tipado estático
- **Tailwind CSS v4** mediante el plugin de Vite (`@tailwindcss/vite`)
- **Vite 8** como bundler y dev server
- **Fetch API** nativo del navegador para llamadas HTTP

---

## ⚙️ Variables de entorno / Configuración

La URL base del backend se configura directamente en `src/services/api.ts`:

```typescript
// Producción (desplegado)
const BASE_URL = 'http://157.137.222.93:8080/timeTracker/api/v1';

// Local (con el backend corriendo en tu máquina)
// const BASE_URL = 'http://localhost:8080/timeTracker/api/v1';
```

Cambia el comentario según el entorno en que estés trabajando.

---

## 🚀 Instalación y uso local

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar el servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`.

> **Requisito:** El backend de TimeTracker debe estar corriendo y accesible para que las llamadas a la API funcionen. Asegúrate de que el CORS esté habilitado en el backend.

---

## 📦 Build para producción

```bash
npm run build
```

El resultado se genera en la carpeta `dist/`, lista para servirse con cualquier servidor de archivos estáticos (Nginx, Vercel, Netlify, etc.).

---

## 🔗 Relación con el Backend

Este frontend consume la **API REST** del módulo `time-tracker-back`. Los endpoints utilizados son:

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/users` | Listar todos los usuarios |
| `POST` | `/users/create-user` | Crear un usuario |
| `DELETE` | `/users/{id}/delete-user` | Eliminar un usuario |
| `GET` | `/activities` | Listar todas las actividades |
| `POST` | `/activities/create-activity` | Crear una actividad |
| `DELETE` | `/activities/{id}/delete-activity` | Eliminar una actividad |

> El filtrado por usuario y el cálculo de puntos por usuario se realiza **en el frontend** para mantener el backend sin modificaciones.
