/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Group, GradingCriteria } from '../types';

interface CriteriaViewProps {
  groups: Group[];
  selectedGroupId?: string;
  onSelectGroup: (groupId: string) => void;
  onUpdateCriteria: (groupId: string, criteria: GradingCriteria) => void;
  onOpenCreateGroup: () => void;
}

export const CriteriaView: React.FC<CriteriaViewProps> = ({
  groups,
  selectedGroupId,
  onSelectGroup,
  onUpdateCriteria,
  onOpenCreateGroup,
}) => {
  const currentGroup = groups.find((g) => g.id === selectedGroupId) || groups[0];

  const [weights, setWeights] = useState(currentGroup?.criteria.weights || {
    homework: 35,
    exams: 20,
    attendance: 20,
    participation: 15,
    selfEval: 10,
  });
  const [scale, setScale] = useState<'decimal' | 'centesimal' | 'letters'>(currentGroup?.criteria.scale || 'decimal');
  const [minPassingGrade, setMinPassingGrade] = useState(currentGroup?.criteria.minPassingGrade || 7.0);
  const [toastMessage, setToastMessage] = useState(false);

  // Sync if selected group changes
  React.useEffect(() => {
    if (currentGroup) {
      setWeights(currentGroup.criteria.weights);
      setScale(currentGroup.criteria.scale);
      setMinPassingGrade(currentGroup.criteria.minPassingGrade);
    }
  }, [currentGroup?.id]);

  if (!currentGroup) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-on-surface-variant">No hay grupos disponibles.</p>
        <button 
          onClick={onOpenCreateGroup}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold"
        >
          Dar de Alta Nuevo Grupo
        </button>
      </div>
    );
  }

  const totalWeight = weights.homework + weights.exams + weights.attendance + weights.participation + weights.selfEval;

  const handleSave = () => {
    if (totalWeight !== 100) return;
    onUpdateCriteria(currentGroup.id, {
      preset: currentGroup.criteria.preset,
      weights,
      scale,
      minPassingGrade: Number(minPassingGrade)
    });
    setToastMessage(true);
    setTimeout(() => setToastMessage(false), 3000);
  };

  return (
    <div className="flex flex-col w-full pb-16 px-space-lg pt-space-lg">
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-[#1E3A8A] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>Criterios actualizados y propagados al Cuaderno de Notas.</span>
        </div>
      )}

      {/* Top Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-lg border-b border-[#E2E8F0]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
            <span className="material-symbols-outlined text-sm">rule</span>
            <span>Reglamento y Ponderaciones</span>
            <span>•</span>
            <span className="text-secondary font-semibold font-mono-numeric">{currentGroup.academicCycle}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Criterios de Evaluación</h1>
            <div className="relative">
              <select
                value={currentGroup.id}
                onChange={(e) => onSelectGroup(e.target.value)}
                className="h-9 pl-3 pr-8 text-xs font-bold text-primary bg-surface-container-low rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-secondary cursor-pointer"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.code} - {g.name} ({g.section})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={totalWeight !== 100}
          className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-all flex items-center gap-1.5 shadow-md shadow-primary/20 disabled:opacity-50 cursor-pointer self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-base">check</span>
          <span>Guardar Cambios</span>
        </button>
      </header>

      {/* Main Configuration Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg py-space-lg">
        {/* Left: Weight Distribution Engine */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          <div className="bg-surface-container-lowest rounded-xl p-space-lg border border-[#E2E8F0] shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-space-sm border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-xl">balance</span>
                <h3 className="text-sm font-bold text-on-surface">Ponderación Oficial del Ciclo</h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono-numeric font-bold ${
                totalWeight === 100 ? 'bg-surface-container text-secondary' : 'bg-red-100 text-red-700'
              }`}>
                {totalWeight}% Asignado
              </span>
            </div>

            {/* Dynamic Distribution Bar */}
            <div className="flex flex-col gap-2">
              <div className="h-4 w-full bg-surface-container-high rounded-full overflow-hidden flex shadow-inner">
                <div className="bg-secondary h-full transition-all duration-300" style={{ width: `${weights.homework}%` }}></div>
                <div className="bg-primary h-full transition-all duration-300" style={{ width: `${weights.exams}%` }}></div>
                <div className="bg-tertiary-container h-full transition-all duration-300" style={{ width: `${weights.attendance}%` }}></div>
                <div className="bg-secondary-container h-full transition-all duration-300" style={{ width: `${weights.participation}%` }}></div>
                <div className="bg-primary-fixed-dim h-full transition-all duration-300" style={{ width: `${weights.selfEval}%` }}></div>
              </div>
            </div>

            {/* Weight Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-2">
              <div className="p-3 bg-surface-container-low rounded-lg border border-[#E2E8F0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-secondary"></span>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-on-surface">Tareas y Trabajos</span>
                    <span className="text-[10px] text-on-surface-variant">Entregables semanales y prácticas</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={weights.homework}
                    onChange={(e) => setWeights({ ...weights, homework: Number(e.target.value) })}
                    className="w-14 h-8 bg-white border border-[#CBD5E1] rounded text-center font-mono-numeric text-xs font-bold text-primary"
                  />
                  <span className="text-xs font-bold">%</span>
                </div>
              </div>

              <div className="p-3 bg-surface-container-low rounded-lg border border-[#E2E8F0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary"></span>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-on-surface">Exámenes y Pruebas</span>
                    <span className="text-[10px] text-on-surface-variant">Evaluaciones parciales y departamentales</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={weights.exams}
                    onChange={(e) => setWeights({ ...weights, exams: Number(e.target.value) })}
                    className="w-14 h-8 bg-white border border-[#CBD5E1] rounded text-center font-mono-numeric text-xs font-bold text-primary"
                  />
                  <span className="text-xs font-bold">%</span>
                </div>
              </div>

              <div className="p-3 bg-surface-container-low rounded-lg border border-[#E2E8F0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-tertiary-container"></span>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-on-surface">Asistencia y Puntualidad</span>
                    <span className="text-[10px] text-on-surface-variant">Calculado desde el pase de lista</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={weights.attendance}
                    onChange={(e) => setWeights({ ...weights, attendance: Number(e.target.value) })}
                    className="w-14 h-8 bg-white border border-[#CBD5E1] rounded text-center font-mono-numeric text-xs font-bold text-primary"
                  />
                  <span className="text-xs font-bold">%</span>
                </div>
              </div>

              <div className="p-3 bg-surface-container-low rounded-lg border border-[#E2E8F0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-secondary-container"></span>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-on-surface">Participación y Talleres</span>
                    <span className="text-[10px] text-on-surface-variant">Debates, resolución en pizarrón</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={weights.participation}
                    onChange={(e) => setWeights({ ...weights, participation: Number(e.target.value) })}
                    className="w-14 h-8 bg-white border border-[#CBD5E1] rounded text-center font-mono-numeric text-xs font-bold text-primary"
                  />
                  <span className="text-xs font-bold">%</span>
                </div>
              </div>

              <div className="p-3 bg-surface-container-low rounded-lg border border-[#E2E8F0] flex items-center justify-between sm:col-span-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary-fixed-dim"></span>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-on-surface">Autoevaluación Formativa</span>
                    <span className="text-[10px] text-on-surface-variant">Reflexión de competencias y metacognición</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={weights.selfEval}
                    onChange={(e) => setWeights({ ...weights, selfEval: Number(e.target.value) })}
                    className="w-14 h-8 bg-white border border-[#CBD5E1] rounded text-center font-mono-numeric text-xs font-bold text-primary"
                  />
                  <span className="text-xs font-bold">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Rubric Scale Table */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg border border-[#E2E8F0] shadow-sm flex flex-col gap-space-md">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-lg">fact_check</span>
              <span>Rúbrica Institucional de Desempeño</span>
            </h3>

            <div className="overflow-hidden rounded-lg border border-[#E2E8F0] text-xs">
              <div className="grid grid-cols-12 bg-surface-container-high/60 p-2.5 font-semibold text-on-surface-variant uppercase text-[10px] tracking-wider">
                <div className="col-span-3">Nivel de Desempeño</div>
                <div className="col-span-2 text-center">Rango</div>
                <div className="col-span-7">Descriptor Cualitativo</div>
              </div>
              <div className="divide-y divide-[#F1F5F9]">
                <div className="grid grid-cols-12 p-3 items-center bg-[#ECFDF5]/30">
                  <div className="col-span-3 font-bold text-[#065F46] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]"></span> Excelente
                  </div>
                  <div className="col-span-2 text-center font-mono-numeric font-bold text-[#065F46]">9.0 - 10.0</div>
                  <div className="col-span-7 text-[11px] text-on-surface">
                    Dominio sobresaliente y autónomo de principios cuánticos y experimentales.
                  </div>
                </div>

                <div className="grid grid-cols-12 p-3 items-center">
                  <div className="col-span-3 font-bold text-primary flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span> Notable
                  </div>
                  <div className="col-span-2 text-center font-mono-numeric font-bold text-primary">8.0 - 8.9</div>
                  <div className="col-span-7 text-[11px] text-on-surface">
                    Cumplimiento consistente con rigor metodológico y entregas formales.
                  </div>
                </div>

                <div className="grid grid-cols-12 p-3 items-center bg-[#FFFBEB]/30">
                  <div className="col-span-3 font-bold text-[#92400E] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span> Suficiente
                  </div>
                  <div className="col-span-2 text-center font-mono-numeric font-bold text-[#92400E]">7.0 - 7.9</div>
                  <div className="col-span-7 text-[11px] text-on-surface">
                    Comprensión básica de principios fundamentales; requiere afinar rigor.
                  </div>
                </div>

                <div className="grid grid-cols-12 p-3 items-center bg-[#FEF2F2]/30">
                  <div className="col-span-3 font-bold text-[#991B1B] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span> Insuficiente
                  </div>
                  <div className="col-span-2 text-center font-mono-numeric font-bold text-[#991B1B]">&lt; 7.0</div>
                  <div className="col-span-7 text-[11px] text-on-surface">
                    No alcanza las competencias mínimas; requiere canalización a tutoría.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Scale & Minimum Passing */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          <div className="bg-surface-container-lowest rounded-xl p-space-md border border-[#E2E8F0] shadow-sm flex flex-col gap-4">
            <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Parámetros de Calificación</h4>

            <div>
              <label className="text-xs font-semibold text-on-surface">Escala Numérica</label>
              <select
                value={scale}
                onChange={(e) => setScale(e.target.value as any)}
                className="w-full h-9 px-3 text-xs bg-surface-container-low rounded-lg border border-[#CBD5E1] mt-1 cursor-pointer"
              >
                <option value="decimal">Decimal Oficial (0.0 a 10.0)</option>
                <option value="centesimal">Centesimal (0 a 100 puntos)</option>
                <option value="letters">Letras Internacional (A, B, C, D, F)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-on-surface">Mínimo Aprobatorio Institucional</label>
              <div className="relative flex items-center mt-1">
                <span className="material-symbols-outlined absolute left-2.5 text-secondary text-base">grade</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={minPassingGrade}
                  onChange={(e) => setMinPassingGrade(Number(e.target.value))}
                  className="w-full h-9 pl-8 pr-3 text-xs font-bold font-mono-numeric bg-surface-container-low rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-secondary"
                />
              </div>
              <p className="text-[10px] text-on-surface-variant mt-1">
                Calificaciones inferiores a {minPassingGrade} se marcarán automáticamente con el indicador crítico en el cuaderno.
              </p>
            </div>

            <div className="p-3 bg-surface-container-low rounded-lg border border-[#E2E8F0] text-xs text-on-surface-variant">
              <span className="font-semibold text-on-surface block mb-1">Normativa Vigente</span>
              De acuerdo con el reglamento de Servicios Escolares de Campus Norte, los exámenes no podrán exceder el 50% de la ponderación global.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
