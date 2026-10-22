# Plan de Implementación: Autenticación con Roles, Gestión de Ciclos Escolares y Soporte Admin

Implementación de un sistema integral de autenticación y control de acceso por roles (Administrador vs. Docente) con gestión dinámica de ciclos escolares, aislamiento de materias por profesor, persistencia local segura y utilidades de respaldo/exportación para el entorno de GitHub Pages.

---

## 1. Decisiones y Respuestas del Usuario
- **Persistencia**: Almacenamiento local persistente (`localStorage`) enriquecido con exportación/importación completa en formato JSON para copias de seguridad sin dependencias externas en GitHub Pages.
- **Credenciales iniciales de Administrador**: `admin@escuela.edu` con contraseña predeterminada `123456` (totalmente editable desde el panel de administración).
- **Selector de Ciclo Escolar**: Selector global sincronizado en barra superior y menú lateral que filtra grupos, materias, notas y pase de lista.

---

## 2. Cambios Propuestos

### A. Modelos de Datos y Tipos (`src/types.ts`)
- **`User`**:
  ```ts
  export type UserRole = 'admin' | 'teacher';
  export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    avatarUrl?: string;
    department?: string;
    assignedGroupIds?: string[];
    createdAt: string;
  }
  ```
- **`AcademicCycle`**:
  ```ts
  export interface AcademicCycle {
    id: string;
    name: string; // ej. 'Ciclo 2024-2025 • P2'
    code: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'closed' | 'upcoming';
    isDefault?: boolean;
    periodStructure: 'parciales' | 'trimestres' | 'semestres';
    periodsCount: number;
  }
  ```
- Adaptar `Group` para asociar explícitamente `teacherId` y `cycleId`.

---

### B. Módulo de Autenticación y Pantalla de Acceso (`src/components/LoginView.tsx`)
- Pantalla de inicio de sesión moderna y profesional con la identidad visual de **AulaGrade**.
- Formulario de acceso por correo y contraseña.
- Botones de "Acceso Rápido de Demostración" (para probar al instante como *Administrador* o como *Prof. Carlos Mendoza*).
- Mensajes claros de error ante credenciales incorrectas.
- Persistencia de sesión en `sessionStorage`/`localStorage` para mantener la sesión activa al recargar la página.

---

### C. Módulo de Administración (`src/components/AdminPanel.tsx`)
El administrador tendrá su propio espacio dentro del sistema para soporte y configuración:
1. **Gestión de Ciclos Escolares**:
   - Crear nuevos ciclos (nombre, fechas de inicio/fin, número de parciales).
   - Establecer el ciclo activo por defecto.
   - Activar, pausar o cerrar periodos escolares.
2. **Gestión de Profesores y Cuentas**:
   - Crear nuevos usuarios con correo, nombre, contraseña y departamento.
   - Asignar grupos y materias a cada docente.
   - Restablecer contraseñas o modificar permisos.
3. **Mantenimiento y Respaldo (Soporte)**:
   - Descargar copia de seguridad completa (`.json`) con todos los ciclos, maestros, grupos, alumnos y calificaciones.
   - Cargar/restaurar copia de seguridad desde un archivo `.json`.
   - Botón de restablecimiento a valores iniciales de fábrica con confirmación.

---

### D. Experiencia del Docente y Filtrado por Ciclo
- **Aislamiento de Información**: El docente autenticado solo verá los grupos y materias que tiene asignados o que él mismo crea.
- **Selector de Ciclo Escolar Activo**:
  - Selector visible en el encabezado (`Header`) y barra lateral (`Sidebar`).
  - Al cambiar de ciclo, el Dashboard, Cuaderno de Notas, Calificaciones Finales y Pase de Lista se filtran automáticamente.
- **Perfil y Cierre de Sesión**:
  - En el Header, el menú desplegable del avatar mostrará el nombre real del usuario autenticado, su rol y la opción de **"Cerrar Sesión"**.

---

### E. Integración en `src/App.tsx`, `Header.tsx` y `Sidebar.tsx`
- Estado de autenticación `currentUser: User | null`. Si no hay usuario activo, renderizar `LoginView`.
- Si `currentUser.role === 'admin'`: mostrar menú de administración en el `Sidebar` (Ciclos Escolares, Profesores, Respaldo/Soporte, Vista General de Grupos).
- Si `currentUser.role === 'teacher'`: mostrar menú docente (Dashboard, Alta de Grupo, Criterios, Calificaciones Finales, Cuaderno de Notas, Pase de Lista).
- Sincronización transparente de ciclos y usuarios en `localStorage`.

---

## 3. Plan de Verificación

### Pruebas Funcionales:
1. **Flujo de Inicio de Sesión**:
   - Iniciar sesión con `admin@escuela.edu` / `123456` -> Acceso directo a panel de administración y control total.
   - Cerrar sesión y acceder como Docente (`c.mendoza@aulagrade.edu` / `docente123`).
   - Verificar que el docente solo vea sus materias asignadas.
2. **Creación de Nuevo Ciclo Escolar**:
   - Como Administrador, registrar un nuevo ciclo (ej. `Ciclo 2025-2026 • P1`).
   - Cambiar al rol Docente y verificar que el nuevo ciclo aparezca disponible en el selector de la barra superior.
3. **Creación de Nuevo Profesor y Asignación**:
   - Registrar una nueva cuenta de profesor desde el panel Admin.
   - Iniciar sesión con esa nueva cuenta y comprobar que su entorno arranque listo para sus asignaturas.
4. **Respaldo y Restauración**:
   - Exportar los datos actuales en archivo `.json`.
   - Modificar una calificación o grupo, y luego importar el archivo de respaldo para comprobar que restaura fielmente el estado.
5. **Compilación y Construcción**:
   - Ejecutar `compile_applet` para asegurar cero errores de TypeScript y empaquetado de producción óptimo para GitHub Pages.
