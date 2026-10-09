# Sincronización y Persistencia de Herramientas y Habilidades en Firestore

Plan estructurado para resolver el problema de reversión de cambios en la base de datos, implementar un acceso visible con Google para el propietario (Wilson Rojas) y garantizar la persistencia inmediata tanto de herramientas como de habilidades del CV digital.

## User Review & Critical Decisions

> [!IMPORTANT]
> Decisiones confirmadas por el usuario:
> - **Acceso Administrativo**: Autenticación directa y visible con cuenta de Google (`rojaswil336@gmail.com`) en la interfaz (sin depender de atajos o clics ocultos).
> - **Alcance de Sincronización**: Persistencia y sincronización completa en Firestore para:
>   1. **Herramientas de Trabajo & Tecnologías** (sección interactiva de la página principal).
>   2. **Habilidades Técnicas por Categorías** (sección editable del CV Digital).

---

## 1. Overview & Core Concept

- **Diagnóstico del Fallo Actual**: Al agregar una herramienta o editar una habilidad, la interfaz la reflejaba temporalmente en el estado local de React, pero al no tener una sesión activa de Google Auth en el cliente, Firebase Firestore rechazaba la escritura por reglas de seguridad (`PERMISSION_DENIED`). Transcurridos 1 o 2 segundos, el listener en tiempo real (`onSnapshot`) recibía el documento inalterado del servidor y sobreescribía el estado local, causando que la herramienta desapareciera.
- **Solución Propuesta**:
  1. Integrar un botón visible y profesional de inicio de sesión con Google para el propietario, mostrando claramente el estado de autenticación (conectado como Wilson Rojas vs. modo visitante).
  2. Vincular el modo "Dueño (Editor)" con la validación de la sesión de Google: si Wilson inicia sesión, tiene permisos plenos garantizados de escritura en la base de datos. Si no está autenticado e intenta editar, se le presenta un diálogo intuitivo para iniciar sesión en 1 clic.
  3. Optimizar las funciones de guardado (`saveTechStack` y `handleUpdateCV`) para confirmar escrituras en Firestore, registrar errores con alertas claras en lugar de reversiones silenciosas y mantener el caché sincronizado.
  4. Revisar y auditar `firestore.rules` y `firebase-blueprint.json` para que los esquemas de `cv_data/tech_stack` y `cv_data/main` permitan las operaciones de creación, edición y ordenación sin restricciones erróneas de longitud o formato.

---

## 2. User Experience & Visual Design

- **Botón de Acceso para el Propietario en Navbar y Drawer Móvil**:
  - Un botón elegante y discreto en la barra superior:
    - Cuando no hay sesión: Botón con ícono de Google *"Acceso Administrador"*.
    - Cuando está autenticado como Wilson: Badge verde con avatar/iniciales *"Wilson Rojas (Conectado)"* y opción para cerrar sesión.
- **Feedback Inmediato de Guardado**:
  - El indicador de sincronización existente (`SyncIndicator`) notificará con precisión: *"Guardando en Firestore..."* -> *"Sincronizado con la nube"*, o en caso de error: *"Error de permisos: inicia sesión con Google"*.
- **Modal de Agregar/Editar Herramienta**:
  - Detección automática del ícono SVG vía Devicon CDN a medida que se escribe el nombre de la tecnología.
  - Validación de campos requeridos (nombre no vacío).
  - Confirmación visual inmediata y persistencia sin parpadeos.
- **Edición de Habilidades en el CV Digital**:
  - Creación y edición fluida de categorías de habilidades (Nube, Lenguajes, Frameworks, etc.).
  - Agregar, editar y eliminar habilidades con guardado debounced a Firestore (`cv_data/main`).

---

## 3. Key Product Decisions & Trade-Offs

- **Autenticación con Google Popup vs. Escritura Pública**:
  - *Decisión*: Proteger la base de datos mediante Google Popup (`signInWithPopup`) restringido a `rojaswil336@gmail.com`.
  - *Razón*: Evita que visitantes no autorizados modifiquen o borren herramientas o el CV público, protegiendo la integridad del portafolio profesional de Wilson Rojas.
- **Manejo de Reversión Local**:
  - *Decisión*: Manejar el rollback solo si Firestore falla, mostrando un mensaje explicativo al usuario indicándole la razón (p. ej. sesión requerida) en lugar de ocultar el error.
- **Estructura Documental en Firestore**:
  - `cv_data/tech_stack`: Lista de herramientas interactivas `{ items: Array<{ name, logoUrl, description, enabled }> }`.
  - `cv_data/main`: Información completa del CV `{ contact, summary, experience, education, skillCategories, featuredProjects }`.
  - `projects/{projectId}`: Colección de proyectos individuales.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                       INTERFAZ DE USUARIO                   │
│                                                             │
│  [Botón Google Login] ──► Firebase Auth (Google Provider)   │
│         │                                                   │
│         ▼                                                   │
│   Estado de Sesión ──► ¿Es rojaswil336@gmail.com?           │
│         │                    │                              │
│         │                    ├─► SÍ: Activar Modo Editor    │
│         │                    └─► NO: Solo Modo Lectura      │
└─────────┼───────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    MANEJADORES DE PERSISTENCIA              │
│                                                             │
│  1. saveTechStack()   ──► doc(db, 'cv_data', 'tech_stack')  │
│  2. handleUpdateCV()  ──► doc(db, 'cv_data', 'main')        │
│  3. saveProject()     ──► doc(db, 'projects', id)           │
└─────────┬───────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│              FIREBASE FIRESTORE & SECURITY RULES            │
│                                                             │
│  • allow read: if true (Lectura pública para reclutadores) │
│  • allow write: if request.auth.token.email ==              │
│                    'rojaswil336@gmail.com'                  │
│  • onSnapshot: Sincronización en tiempo real sin descarte   │
└─────────────────────────────────────────────────────────────┘
```

### Componentes y Archivos Clave a Modificar

1. **`src/App.tsx`**:
   - Reemplazar el mecanismo de 5 clics ocultos por un botón visible de inicio/cierre de sesión con Google.
   - Sincronizar el estado `isOwner` directamente con `currentUser?.email === 'rojaswil336@gmail.com'`.
   - Si un usuario presiona "Dueño (Editor)" sin sesión activa, abrir automáticamente el diálogo de inicio de sesión de Google.
   - Robustecer `saveTechStack` y `handleUpdateCV` con manejo de errores claro y actualización del `SyncIndicator`.
2. **`firestore.rules` & `firebase-blueprint.json`**:
   - Verificar y asegurar las reglas de lectura pública y escritura para `cv_data` y `projects`.
   - Ejecutar despliegue con la herramienta de Firebase para sincronizar las reglas de la base de datos.
3. **`src/components/CVDigital.tsx`**:
   - Asegurar que la adición, edición y eliminación de habilidades en cada categoría ejecute `onUpdate` con tipado correcto y dispare la persistencia en `cv_data/main`.
