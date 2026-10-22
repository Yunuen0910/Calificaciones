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

---

## 🛠️ Tecnologías Utilizadas

- **React 19** con hooks modernos.
- **TypeScript** para seguridad de tipos estricta.
- **Vite 8** para desarrollo ultra-rápido y compilación optimizada.
- **Tailwind CSS v4** con tokens de diseño limpios y responsivos.
- **Material Symbols** de Google Fonts para iconografía intuitiva.

---

## 💻 Ejecución en Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/<tu-usuario>/Calificaciones.git
cd Calificaciones

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000/`.

---

## 🌐 Despliegue en GitHub Pages

El proyecto incluye el flujo automatizado en `.github/workflows/deploy.yml`.

1. En tu repositorio de GitHub, ve a **Settings** -> **Pages**.
2. En **Build and deployment** -> **Source**, selecciona **GitHub Actions**.
3. Haz un `git push` a la rama `main`:
   ```bash
   git add .
   git commit -m "Despliegue AulaGrade"
   git push origin main
   ```
4. GitHub Actions construirá y publicará automáticamente tu aplicación en `https://<tu-usuario>.github.io/Calificaciones/`.
