/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Group } from '../types';

interface SuccessCreatedModalProps {
  isOpen: boolean;
  group: Group | null;
  onGoToGrades: () => void;
  onGoToAttendance: () => void;
  onGoToDashboard: () => void;
}

export const SuccessCreatedModal: React.FC<SuccessCreatedModalProps> = ({
  isOpen,
  group,
  onGoToGrades,
  onGoToAttendance,
  onGoToDashboard,
}) => {
  if (!isOpen || !group) return null;

  const activeSessions = group.schedule.filter(s => s.active);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0] flex flex-col gap-4 text-center">
        {/* Animated Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <span className="material-symbols-outlined text-3xl">check_circle</span>
        </div>

        <div>
          <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
            ¡Grupo Activado con Éxito!
          </span>
          <h2 className="text-xl font-bold text-on-surface mt-1">
            {group.name} ({group.code} • {group.section})
          </h2>
          <p className="text-xs text-on-surface-variant mt-1.5 max-w-sm mx-auto">
            Se han generado automáticamente las matrices académicas para los <strong className="text-on-surface">{group.students.length} estudiantes</strong> matriculados en <strong className="text-on-surface">{group.academicCycle}</strong>.
          </p>
        </div>

        {/* Feature Summary Checklist */}
        <div className="bg-surface-container-low p-3.5 rounded-xl border border-[#E2E8F0] text-left flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-emerald-600 text-base">check</span>
            <span><strong className="font-semibold">Cuaderno de Notas</strong> configurado con 6 criterios ({group.criteria.weights.homework}% tareas, {group.criteria.weights.exams}% exámenes, {group.criteria.weights.projects || 0}% proyectos, etc.).</span>
          </div>
          <div className="flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-emerald-600 text-base">check</span>
            <span><strong className="font-semibold">Pase de Asistencia</strong> inicializado para {activeSessions.length} sesiones semanales en {group.classroom}.</span>
          </div>
          <div className="flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-emerald-600 text-base">check</span>
            <span>Tolerancia de retardo fijada en <strong className="font-semibold">{group.lateTolerance}</strong> antes de registrar falta.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
          <button
            onClick={onGoToGrades}
            className="w-full sm:flex-1 py-2.5 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">edit_note</span>
            <span>Abrir Cuaderno</span>
          </button>

          <button
            onClick={onGoToAttendance}
            className="w-full sm:flex-1 py-2.5 rounded-lg bg-surface-container-high text-on-surface text-xs font-bold hover:bg-surface-variant transition-colors flex items-center justify-center gap-1.5 shadow-sm border border-[#E2E8F0] cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">how_to_reg</span>
            <span>Pasar Lista</span>
          </button>

          <button
            onClick={onGoToDashboard}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};
