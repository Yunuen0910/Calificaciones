# AulaGrade - Plataforma Académica y Gestión de Grupos 🎓

Sistema integral y moderno para docentes e instituciones educativas: gestión de grupos escolares, cuaderno de notas ponderado por periodos/parciales, pase de lista diario y consolidado de calificaciones finales con boletas de acreditación.

---

## 🚀 Módulos y Funcionalidades

1. **Dashboard**
   - Vista panorámica de todos los grupos asignados y métricas clave (promedio general, porcentaje de asistencia, alumnos en riesgo).
   - Accesos directos a cada sección por grupo.

2. **Alta de Nuevo Grupo**
   - Configuración de grado escolar (1º a 6º de primaria, secundaria o bachillerato/universidad).
   - Selección de esquema académico: **Año Escolar**, **Semestre**, **Cuatrimestre**, **Trimestre** o **Bimestre**.
   - Carga y registro de estudiantes con matrícula y estatus inicial.

3. **Criterios de Evaluación**
   - Definición de esquemas de evaluación: **Por Parciales**, **Por Trimestres**, **Por Bimestres** o **Por Periodos**.
   - Ponderación porcentual de criterios (Exámenes, Tareas, Proyectos, Asistencia, etc.) con validación automática al 100%.

4. **Calificaciones Finales**
   - Sábana consolidada de calificaciones de todos los periodos y cálculo de promedio general.
   - Generación de boleta individual por alumno con desglose de desempeño y estatus de acreditación (Aprobado / No Acreditado).
   - Exportación de resultados.

5. **Cuaderno de Notas**
   - Registro de actividades y calificaciones por parcial/periodo aislado.
   - Ponderación en tiempo real y cálculo de subtotal por corte con pestañas separadas.

6. **Pase de Lista**
   - Registro diario de asistencia interactivo con un clic: Presente (P), Retardo (R), Falta (F) y Justificado (J).
   - Métricas de puntualidad y porcentaje de asistencia por estudiante.

7. **Control de Acceso y Roles (Admin & Docentes)**
   - **Administrador**: Gestión institucional, creación de cuentas de profesores, alta y cambio de Ciclos Escolares (activo/cerrado), auditoría de grupos y copias de seguridad JSON.
   - **Docentes**: Acceso privado con usuario/contraseña, aislamiento estricto de materias y grupos asignados, y filtro por ciclo escolar activo.

8. **Respaldo y Portabilidad de Datos**
   - Exportación de base de datos completa en archivo `.json` con un clic.
   - Restauración inmediata de respaldos y opción de restablecimiento de fábrica.

---

## 🔑 Credenciales Iniciales de Demostración

| Rol | Correo Electrónico | Contraseña | Permisos |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@escuela.edu` | `123456` | Acceso total institucional, ciclos y docentes |
| **Docente (Ciencias)** | `c.mendoza@aulagrade.edu` | `123456` | Gestión de Física y Química |
| **Docente (Matemáticas)** | `m.hernandez@aulagrade.edu` | `123456` | Gestión de Álgebra y Geometría |

*(La pantalla de inicio de sesión incluye botones de acceso rápido para probar cualquier rol en un solo clic).*

---

## 🛠️ Tecnologías Utilizadas

- **React 19** con hooks modernos.
- **TypeScript** para seguridad de tipos estricta.
- **Vite 8** para desarrollo ultra-rápido y compilación optimizada.
- **Tailwind CSS v4** con tokens de diseño limpios y responsivos.
- **Material Symbols** de Google Fonts para iconografía intuitiva.
- **LocalStorage API** para persistencia local automática sin servidores externos.

---

## 🚀 Despliegue en Producción

### Opción 1: GitHub Pages (Recomendado para repositorios de GitHub)

El proyecto ya cuenta con el archivo de automatización listo en `.github/workflows/deploy.yml` y configuración de rutas relativas (`base: './'` en `vite.config.ts`).

1. Sube tus cambios a GitHub:
   ```bash
   git add .
   git commit -m "Preparar para producción"
   git push origin main
   ```
2. En tu repositorio en GitHub, ve a **Settings** (Configuración) > **Pages**.
3. En la sección **Build and deployment**:
   - En **Source**, selecciona **GitHub Actions**.
4. ¡Listo! En la pestaña **Actions** verás el flujo desplegando automáticamente tu aplicación. Tu sitio estará disponible en:
   `https://<tu-usuario>.github.io/<nombre-repositorio>/`

---

### Opción 2: Vercel, Netlify o Cloudflare Pages

1. Conecta tu repositorio de GitHub a tu cuenta de Vercel/Netlify.
2. Parámetros de compilación:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
3. Despliega en 1 clic.

---

### Opción 3: Servidor Web Estático Propio (Apache, Nginx, CPanel)

1. Ejecuta la compilación local:
   ```bash
   npm run build
   ```
2. Copia todo el contenido de la carpeta `/dist` a la raíz de tu servidor (`public_html`, `/var/www/html`, etc.).

---

## 💻 Ejecución en Desarrollo Local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000/`.
