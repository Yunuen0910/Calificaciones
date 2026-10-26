/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Group, AssignmentGrade, Student, InstitutionInfo } from '../types';
import { NavTab } from './Sidebar';

interface FinalGradesViewProps {
  groups: Group[];
  selectedGroupId?: string;
  onSelectGroup: (groupId: string) => void;
  assignments: AssignmentGrade[];
  scores: Record<string, Record<string, number>>;
  onNavigateToTab: (tab: NavTab) => void;
  institutionInfo?: InstitutionInfo;
}

export const FinalGradesView: React.FC<FinalGradesViewProps> = ({
  groups,
  selectedGroupId,
  onSelectGroup,
  assignments,
  scores,
  onNavigateToTab,
  institutionInfo,
}) => {
  const currentGroup = groups.find((g) => g.id === selectedGroupId) || groups[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'passing' | 'risk' | 'failing'>('all');
  const [selectedStudentForBoleta, setSelectedStudentForBoleta] = useState<Student | null>(null);
  const [teacherNotes, setTeacherNotes] = useState<Record<string, string>>({
    'std-1': 'Excelente desempeño académico y participación activa en proyectos de investigación.',
    'std-2': 'Buen aprovechamiento general. Se recomienda reforzar preparación para exámenes departamentales.',
    'std-3': 'Constancia sobresaliente y gran trabajo colaborativo en talleres y laboratorios.',
    'std-4': 'En riesgo académico. Requiere asesoría especial para regularización antes del cierre de actas.',
    'std-5': 'Muy alto nivel de comprensión conceptual y cumplimiento puntual de actividades.',
    'std-6': 'No acreditado. Requiere inscripción a periodo de evaluación extraordinaria.',
  });
  const [editingNote, setEditingNote] = useState<string>('');

  if (!currentGroup) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-on-surface-variant">No hay grupos disponibles.</p>
        <button 
          onClick={() => onNavigateToTab('alta-grupo')}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold"
        >
          Dar de Alta Nuevo Grupo
        </button>
      </div>
    );
  }

  const { criteria, students } = currentGroup;
  const weights = criteria.weights;
  const structure = criteria.evaluationStructure || 'parciales';
  const numPeriods = criteria.numberOfPeriods || 3;

  const getPeriodName = (idx: number) => {
    switch (structure) {
      case 'trimestres': return `${idx}° Trimestre`;
      case 'parciales': return `${idx}° Parcial`;
      case 'bimestres': return `Bimestre ${idx}`;
      case 'cuatrimestres': return `${idx}° Cuatrimestre`;
      case 'periodos': return `Periodo ${idx}`;
      case 'ciclo_unico': return `Ciclo Anual`;
    }
  };

  // Filter assignments strictly for currentGroup
  const groupAssignments = assignments.filter((a) => {
    if (a.groupId) return a.groupId === currentGroup.id;
    return currentGroup.id === 'grp-fis-302';
  });

  // Calculate student average for a specific period
  const calculatePeriodAverage = (studentId: string, periodIdx: number) => {
    const studentScores = scores[studentId] || {};
    const periodAssignments = groupAssignments.filter(a => a.periodIndex === periodIdx);
    if (periodAssignments.length === 0) return 10.0;

    const getCatPeriodAvg = (category: 'homework' | 'exams' | 'attendance' | 'participation' | 'selfEval') => {
      const catAsgs = periodAssignments.filter(a => a.category === category);
      if (catAsgs.length === 0) return 10.0;
      let sum = 0;
      let count = 0;
      for (const a of catAsgs) {
        if (studentScores[a.id] !== undefined) {
          sum += studentScores[a.id];
          count++;
        }
      }
      return count > 0 ? sum / count : 10.0;
    };

    const hw = getCatPeriodAvg('homework');
    const exam = getCatPeriodAvg('exams');
    const att = getCatPeriodAvg('attendance');
    const part = getCatPeriodAvg('participation');
    const self = getCatPeriodAvg('selfEval');

    const weighted = (
      (hw * weights.homework) +
      (exam * weights.exams) +
      (att * weights.attendance) +
      (part * weights.participation) +
      (self * weights.selfEval)
    ) / 100;

    return Math.round(weighted * 10) / 10;
  };

  // Calculate cumulative criterion average across entire course
  const calculateCriterionCumulative = (studentId: string, category: 'homework' | 'exams' | 'attendance' | 'participation' | 'selfEval') => {
    const studentScores = scores[studentId] || {};
    const catAssignments = groupAssignments.filter(a => a.category === category);
    if (catAssignments.length === 0) return 10.0;
    let sum = 0;
    let count = 0;
    for (const a of catAssignments) {
      if (studentScores[a.id] !== undefined) {
        sum += studentScores[a.id];
        count++;
      }
    }
    return count > 0 ? Math.round((sum / count) * 10) / 10 : 10.0;
  };

  // Calculate final cumulative grade
  const calculateFinalGrade = (studentId: string) => {
    if (structure === 'ciclo_unico') {
      return calculatePeriodAverage(studentId, 1);
    }
    let sumPeriods = 0;
    for (let p = 1; p <= numPeriods; p++) {
      sumPeriods += calculatePeriodAverage(studentId, p);
    }
    return Math.round((sumPeriods / numPeriods) * 10) / 10;
  };

  // Status determination
  const getStudentStatus = (finalGrade: number) => {
    if (finalGrade >= criteria.minPassingGrade) {
      return { key: 'passing', label: 'Acreditado', badgeClass: 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]' };
    }
    if (finalGrade >= 6.0) {
      return { key: 'risk', label: 'En Riesgo / Extraordinario', badgeClass: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]' };
    }
    return { key: 'failing', label: 'No Acreditado', badgeClass: 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]' };
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const finalGrade = calculateFinalGrade(s.id);
    const status = getStudentStatus(finalGrade);

    if (filterStatus !== 'all' && status.key !== filterStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchMatricula = s.matricula.toLowerCase().includes(q);
      return matchName || matchMatricula;
    }
    return true;
  });

  // Group metrics
  const allFinalGrades = students.map(s => calculateFinalGrade(s.id));
  const groupAverage = allFinalGrades.length > 0
    ? (allFinalGrades.reduce((a, b) => a + b, 0) / allFinalGrades.length).toFixed(1)
    : '0.0';
  const passingCount = allFinalGrades.filter(g => g >= criteria.minPassingGrade).length;
  const riskCount = allFinalGrades.filter(g => g >= 6.0 && g < criteria.minPassingGrade).length;
  const failingCount = allFinalGrades.filter(g => g < 6.0).length;
  const passingRate = students.length > 0 ? Math.round((passingCount / students.length) * 100) : 0;

  // Export Consolidated CSV
  const exportConsolidatedCsv = () => {
    const periodCols = Array.from({ length: numPeriods }, (_, i) => getPeriodName(i + 1));
    const header = [
      'Matrícula',
      'Estudiante',
      'Correo',
      ...periodCols,
      `Trabajos (${weights.homework}%)`,
      `Exámenes (${weights.exams}%)`,
      `Asistencia (${weights.attendance}%)`,
      `Participación (${weights.participation}%)`,
      `Autoeval (${weights.selfEval}%)`,
      'Promedio Final Oficial',
      'Dictamen Oficial',
      'Observaciones del Docente'
    ];

    let csvContent = header.map(h => `"${h}"`).join(',') + '\n';

    students.forEach(s => {
      const finalGrade = calculateFinalGrade(s.id);
      const status = getStudentStatus(finalGrade);
      const periodScores = Array.from({ length: numPeriods }, (_, i) => calculatePeriodAverage(s.id, i + 1).toFixed(1));
      const hw = calculateCriterionCumulative(s.id, 'homework').toFixed(1);
      const ex = calculateCriterionCumulative(s.id, 'exams').toFixed(1);
      const att = calculateCriterionCumulative(s.id, 'attendance').toFixed(1);
      const part = calculateCriterionCumulative(s.id, 'participation').toFixed(1);
      const self = calculateCriterionCumulative(s.id, 'selfEval').toFixed(1);
      const note = teacherNotes[s.id] || '';

      const row = [
        s.matricula,
        `"${s.name}"`,
        s.email,
        ...periodScores,
        hw,
        ex,
        att,
        part,
        self,
        finalGrade.toFixed(1),
        `"${status.label}"`,
        `"${note.replace(/"/g, '""')}"`
      ];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Acta_Consolidada_Final_${currentGroup.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col w-full pb-20 px-space-lg pt-space-lg">
      {/* Top Header & Navigation */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-lg border-b border-[#E2E8F0]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
            <span className="material-symbols-outlined text-sm text-secondary">workspace_premium</span>
            <span>Acta Consolidada de Evaluación</span>
            <span>•</span>
            <span className="text-secondary font-semibold font-mono-numeric">{currentGroup.academicCycle}</span>
            <span>•</span>
            <span className="text-on-surface font-semibold capitalize">{structure} ({numPeriods} cortes)</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Calificaciones Finales</h1>
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
          <p className="text-xs text-on-surface-variant mt-0.5">
            Integración de calificaciones por corte evaluativo ({getPeriodName(1)} a {getPeriodName(numPeriods)}) y ponderación de criterios para emisión de acta final.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-space-sm flex-wrap">
          <button
            onClick={() => onNavigateToTab('cuaderno')}
            className="flex items-center gap-1.5 px-3 py-2 bg-surface-container-low text-on-surface hover:bg-surface-container rounded-lg text-xs font-bold border border-[#CBD5E1] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">edit_note</span>
            <span>Cuaderno de Notas</span>
          </button>
          <button
            onClick={() => onNavigateToTab('criterios')}
            className="flex items-center gap-1.5 px-3 py-2 bg-surface-container-low text-on-surface hover:bg-surface-container rounded-lg text-xs font-bold border border-[#CBD5E1] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">tune</span>
            <span>Ponderación</span>
          </button>
          <button
            onClick={exportConsolidatedCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary text-on-primary hover:bg-primary-container rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            <span>Exportar Acta Oficial (CSV)</span>
          </button>
        </div>
      </header>

      {/* KPI Cards Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md my-space-lg">
        {/* Promedio General */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
              Promedio General
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold font-mono-numeric text-primary">{groupAverage}</span>
              <span className="text-xs text-on-surface-variant">/ 10.0</span>
            </div>
            <span className="text-[11px] text-[#065F46] font-medium mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">trending_up</span> Desempeño Grupal Óptimo
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">grade</span>
          </div>
        </div>

        {/* % Acreditados */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
              Acreditación Grupal
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold font-mono-numeric text-[#065F46]">{passingRate}%</span>
              <span className="text-xs text-on-surface-variant font-mono-numeric">({passingCount}/{students.length})</span>
            </div>
            <span className="text-[11px] text-on-surface-variant font-medium mt-1">
              Calificación mínima: ≥ {criteria.minPassingGrade.toFixed(1)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] text-[#065F46] flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">verified</span>
          </div>
        </div>

        {/* En Riesgo */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
              En Riesgo / Extraordinario
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold font-mono-numeric text-[#92400E]">{riskCount}</span>
              <span className="text-xs text-on-surface-variant">estudiantes</span>
            </div>
            <span className="text-[11px] text-[#92400E] font-medium mt-1">
              Rango de 6.0 a 6.9
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#FFFBEB] text-[#92400E] flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">warning</span>
          </div>
        </div>

        {/* No Acreditados */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
              No Acreditados
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold font-mono-numeric text-[#991B1B]">{failingCount}</span>
              <span className="text-xs text-on-surface-variant">estudiantes</span>
            </div>
            <span className="text-[11px] text-[#991B1B] font-medium mt-1">
              Menor a 6.0
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#FEF2F2] text-[#991B1B] flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">cancel</span>
          </div>
        </div>
      </section>

      {/* Control Bar: Search & Status Filters */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md border border-[#E2E8F0] shadow-xs mb-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-sm">search</span>
          <input
            type="text"
            placeholder="Buscar por nombre de alumno o matrícula..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low rounded-lg border border-[#CBD5E1] text-xs focus:outline-none focus:border-secondary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-on-surface-variant hover:text-on-surface text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-on-surface-variant mr-1">Filtrar:</span>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-primary-container text-on-primary border-primary-container shadow-xs'
                : 'bg-surface-container-low text-on-surface border-[#CBD5E1] hover:bg-surface-container'
            }`}
          >
            Todos ({students.length})
          </button>
          <button
            onClick={() => setFilterStatus('passing')}
            className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
              filterStatus === 'passing'
                ? 'bg-[#065F46] text-white border-[#065F46] shadow-xs'
                : 'bg-surface-container-low text-[#065F46] border-[#CBD5E1] hover:bg-surface-container'
            }`}
          >
            Acreditados ({passingCount})
          </button>
          <button
            onClick={() => setFilterStatus('risk')}
            className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
              filterStatus === 'risk'
                ? 'bg-[#92400E] text-white border-[#92400E] shadow-xs'
                : 'bg-surface-container-low text-[#92400E] border-[#CBD5E1] hover:bg-surface-container'
            }`}
          >
            En Riesgo ({riskCount})
          </button>
          <button
            onClick={() => setFilterStatus('failing')}
            className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
              filterStatus === 'failing'
                ? 'bg-[#991B1B] text-white border-[#991B1B] shadow-xs'
                : 'bg-surface-container-low text-[#991B1B] border-[#CBD5E1] hover:bg-surface-container'
            }`}
          >
            Reprobados ({failingCount})
          </button>
        </div>
      </div>

      {/* Sábana de Calificaciones Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-[#E2E8F0] overflow-hidden flex flex-col">
        {/* Table Subtitle Banner */}
        <div className="p-space-sm bg-surface-container-low border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-base">table_chart</span>
            <span className="text-on-surface font-bold">Sábana Oficial de Evaluación Consolidada</span>
            <span className="text-[11px] text-on-surface-variant font-mono-numeric">({filteredStudents.length} alumnos listados)</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-semibold text-on-surface-variant">
            <span>Ponderación Criterios:</span>
            <span className="font-mono-numeric text-primary">Trabajos {weights.homework}%</span>
            <span>•</span>
            <span className="font-mono-numeric text-primary">Examen {weights.exams}%</span>
            <span>•</span>
            <span className="font-mono-numeric text-primary">Asistencia {weights.attendance}%</span>
            <span>•</span>
            <span className="font-mono-numeric text-primary">Part. {weights.participation}%</span>
            <span>•</span>
            <span className="font-mono-numeric text-primary">Auto. {weights.selfEval}%</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              {/* Top grouping row */}
              <tr className="bg-surface-container-high/40 border-b border-[#CBD5E1] text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                <th colSpan={2} className="py-2 px-3 border-r border-[#CBD5E1] text-left">
                  Datos del Alumno
                </th>
                <th colSpan={numPeriods} className="py-2 px-3 border-r border-[#CBD5E1] text-center bg-secondary/5 text-secondary">
                  Cortes Evaluativos ({structure.toUpperCase()})
                </th>
                <th colSpan={5} className="py-2 px-3 border-r border-[#CBD5E1] text-center bg-primary/5 text-primary">
                  Desglose Acumulado por Criterios de Evaluación
                </th>
                <th colSpan={3} className="py-2 px-3 text-center bg-surface-container-low">
                  Dictamen Final
                </th>
              </tr>

              {/* Sub headers */}
              <tr className="bg-surface-container-high/80 border-b border-[#CBD5E1] text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-2 px-3 sticky left-0 bg-surface-container-high/95 z-20 w-28 border-r border-[#CBD5E1]">
                  Matrícula
                </th>
                <th className="py-2 px-3 sticky left-28 bg-surface-container-high/95 z-20 min-w-56 border-r border-[#CBD5E1]">
                  Estudiante
                </th>

                {/* Period Columns */}
                {Array.from({ length: numPeriods }, (_, i) => i + 1).map((idx) => (
                  <th key={idx} className="py-2 px-3 text-center min-w-28 border-r border-[#CBD5E1] bg-secondary/5">
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-on-surface">{getPeriodName(idx)}</span>
                      <span className="text-[10px] text-secondary font-mono-numeric">Prom. Corte</span>
                    </div>
                  </th>
                ))}

                {/* Criteria Columns */}
                <th className="py-2 px-3 text-center min-w-24 border-r border-[#CBD5E1] bg-primary/5">
                  <span className="font-bold text-on-surface">Trabajos</span>
                  <div className="text-[10px] text-primary font-mono-numeric">({weights.homework}%)</div>
                </th>
                <th className="py-2 px-3 text-center min-w-24 border-r border-[#CBD5E1] bg-primary/5">
                  <span className="font-bold text-on-surface">Exámenes</span>
                  <div className="text-[10px] text-primary font-mono-numeric">({weights.exams}%)</div>
                </th>
                <th className="py-2 px-3 text-center min-w-24 border-r border-[#CBD5E1] bg-primary/5">
                  <span className="font-bold text-on-surface">Asistencia</span>
                  <div className="text-[10px] text-primary font-mono-numeric">({weights.attendance}%)</div>
                </th>
                <th className="py-2 px-3 text-center min-w-24 border-r border-[#CBD5E1] bg-primary/5">
                  <span className="font-bold text-on-surface">Part.</span>
                  <div className="text-[10px] text-primary font-mono-numeric">({weights.participation}%)</div>
                </th>
                <th className="py-2 px-3 text-center min-w-24 border-r border-[#CBD5E1] bg-primary/5">
                  <span className="font-bold text-on-surface">Auto.</span>
                  <div className="text-[10px] text-primary font-mono-numeric">({weights.selfEval}%)</div>
                </th>

                {/* Final Grade */}
                <th className="py-2 px-3 text-center font-bold text-primary min-w-28 border-r border-[#CBD5E1] bg-surface-container-low">
                  Promedio Final
                </th>
                {/* Status */}
                <th className="py-2 px-3 text-center font-bold text-on-surface min-w-32 border-r border-[#CBD5E1]">
                  Estatus
                </th>
                {/* Actions */}
                <th className="py-2 px-3 text-center font-bold text-on-surface min-w-28">
                  Boleta
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10 + numPeriods} className="text-center py-10 text-on-surface-variant text-xs">
                    No se encontraron alumnos con los criterios de búsqueda seleccionados.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const finalGrade = calculateFinalGrade(student.id);
                  const status = getStudentStatus(finalGrade);
                  const isPassing = finalGrade >= criteria.minPassingGrade;
                  const isRisk = !isPassing && finalGrade >= 6.0;

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-surface-container-low/50 transition-colors ${
                        idx % 2 === 1 ? 'bg-surface-container-low/20' : ''
                      }`}
                    >
                      {/* Matrícula */}
                      <td className="py-2.5 px-3 sticky left-0 bg-surface-container-lowest z-10 font-mono-numeric font-semibold text-xs text-on-surface border-r border-[#E2E8F0]">
                        {student.matricula}
                      </td>

                      {/* Estudiante */}
                      <td className="py-2.5 px-3 sticky left-28 bg-surface-container-lowest z-10 border-r border-[#E2E8F0]">
                        <div className="flex items-center gap-2.5">
                          {student.avatarUrl ? (
                            <img
                              src={student.avatarUrl}
                              alt={student.name}
                              className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-[#E2E8F0]"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-mono-numeric text-[10px] font-bold shrink-0">
                              {student.initials || student.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs text-on-surface truncate">{student.name}</span>
                            <span className="text-[10px] text-on-surface-variant truncate">{student.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Period Scores */}
                      {Array.from({ length: numPeriods }, (_, i) => i + 1).map((pIdx) => {
                        const pScore = calculatePeriodAverage(student.id, pIdx);
                        const pPassing = pScore >= criteria.minPassingGrade;
                        return (
                          <td
                            key={pIdx}
                            className="py-2.5 px-3 text-center border-r border-[#E2E8F0] font-mono-numeric text-xs font-semibold"
                          >
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                                pPassing
                                  ? 'text-primary bg-primary/5'
                                  : pScore >= 6.0
                                  ? 'text-[#92400E] bg-[#FFFBEB]'
                                  : 'text-[#991B1B] bg-[#FEF2F2]'
                              }`}
                            >
                              {pScore.toFixed(1)}
                            </span>
                          </td>
                        );
                      })}

                      {/* Criteria Scores */}
                      <td className="py-2.5 px-3 text-center border-r border-[#E2E8F0] font-mono-numeric text-xs text-on-surface">
                        {calculateCriterionCumulative(student.id, 'homework').toFixed(1)}
                      </td>
                      <td className="py-2.5 px-3 text-center border-r border-[#E2E8F0] font-mono-numeric text-xs text-on-surface">
                        {calculateCriterionCumulative(student.id, 'exams').toFixed(1)}
                      </td>
                      <td className="py-2.5 px-3 text-center border-r border-[#E2E8F0] font-mono-numeric text-xs text-on-surface">
                        {calculateCriterionCumulative(student.id, 'attendance').toFixed(1)}
                      </td>
                      <td className="py-2.5 px-3 text-center border-r border-[#E2E8F0] font-mono-numeric text-xs text-on-surface">
                        {calculateCriterionCumulative(student.id, 'participation').toFixed(1)}
                      </td>
                      <td className="py-2.5 px-3 text-center border-r border-[#E2E8F0] font-mono-numeric text-xs text-on-surface">
                        {calculateCriterionCumulative(student.id, 'selfEval').toFixed(1)}
                      </td>

                      {/* Promedio Final */}
                      <td className="py-2.5 px-3 text-center font-mono-numeric text-sm font-extrabold border-r border-[#E2E8F0] bg-surface-container-low/40">
                        <span
                          className={
                            isPassing ? 'text-primary' : isRisk ? 'text-[#92400E]' : 'text-[#991B1B]'
                          }
                        >
                          {finalGrade.toFixed(1)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 text-center border-r border-[#E2E8F0]">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${status.badgeClass}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      {/* Action: Ver Boleta */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedStudentForBoleta(student);
                            setEditingNote(teacherNotes[student.id] || '');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-container-low hover:bg-primary hover:text-white text-primary border border-primary/20 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                          title="Ver boleta oficial de calificaciones"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                          <span>Boleta</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Student Boleta Modal */}
      {selectedStudentForBoleta && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#E2E8F0] my-8 animate-fadeIn">
            {/* Boleta Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-3.5">
                {institutionInfo?.logoUrl ? (
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                    <img
                      src={institutionInfo.logoUrl}
                      alt={institutionInfo.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-2xl">school</span>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                    {institutionInfo?.name || 'AulaGrade Instituto Académico'}
                  </span>
                  <h3 className="text-base font-extrabold text-on-surface leading-tight">
                    Boleta Oficial de Calificaciones
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-0.5 flex-wrap">
                    <span>{institutionInfo?.campus || 'Campus Norte'}</span>
                    {institutionInfo?.cctCode && (
                      <>
                        <span>•</span>
                        <span className="font-mono">CCT: {institutionInfo.cctCode}</span>
                      </>
                    )}
                    <span>•</span>
                    <span className="font-semibold text-slate-700">
                      {currentGroup.name} ({currentGroup.code} - {currentGroup.section})
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentForBoleta(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container-high cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Student ID Card Banner */}
            <div className="my-4 p-4 rounded-xl bg-surface-container-low border border-[#CBD5E1] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {selectedStudentForBoleta.avatarUrl ? (
                  <img
                    src={selectedStudentForBoleta.avatarUrl}
                    alt={selectedStudentForBoleta.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                    {selectedStudentForBoleta.initials || selectedStudentForBoleta.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col">
                  <h4 className="text-sm font-extrabold text-on-surface">{selectedStudentForBoleta.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant font-mono-numeric mt-0.5">
                    <span>Matrícula: {selectedStudentForBoleta.matricula}</span>
                    <span>•</span>
                    <span>{currentGroup.academicCycle}</span>
                  </div>
                </div>
              </div>

              {/* Status and Final Grade highlight */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-on-surface-variant">Promedio Final</div>
                  <div className="text-2xl font-black font-mono-numeric text-primary">
                    {calculateFinalGrade(selectedStudentForBoleta.id).toFixed(1)}
                  </div>
                </div>
                <div className="h-8 w-px bg-[#CBD5E1]"></div>
                <div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                      getStudentStatus(calculateFinalGrade(selectedStudentForBoleta.id)).badgeClass
                    }`}
                  >
                    {getStudentStatus(calculateFinalGrade(selectedStudentForBoleta.id)).label}
                  </span>
                </div>
              </div>
            </div>

            {/* Period Breakdown Table */}
            <div className="mb-4">
              <h5 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-secondary">view_timeline</span>
                <span>Desglose por Corte Evaluativo ({structure})</span>
              </h5>
              <div className="border border-[#CBD5E1] rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-surface-container-high/60 text-on-surface-variant font-semibold">
                    <tr className="border-b border-[#CBD5E1]">
                      <th className="py-2 px-3 text-left">Corte</th>
                      <th className="py-2 px-3 text-center">Trabajos ({weights.homework}%)</th>
                      <th className="py-2 px-3 text-center">Exámenes ({weights.exams}%)</th>
                      <th className="py-2 px-3 text-center">Asistencia ({weights.attendance}%)</th>
                      <th className="py-2 px-3 text-center">Part. ({weights.participation}%)</th>
                      <th className="py-2 px-3 text-center">Auto. ({weights.selfEval}%)</th>
                      <th className="py-2 px-3 text-center font-bold text-primary bg-primary/5">Promedio Corte</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {Array.from({ length: numPeriods }, (_, i) => i + 1).map((pIdx) => {
                      const pAvg = calculatePeriodAverage(selectedStudentForBoleta.id, pIdx);
                      return (
                        <tr key={pIdx} className="hover:bg-surface-container-low/30">
                          <td className="py-2 px-3 font-bold text-on-surface">{getPeriodName(pIdx)}</td>
                          <td className="py-2 px-3 text-center font-mono-numeric">
                            {calculateCriterionCumulative(selectedStudentForBoleta.id, 'homework').toFixed(1)}
                          </td>
                          <td className="py-2 px-3 text-center font-mono-numeric">
                            {calculateCriterionCumulative(selectedStudentForBoleta.id, 'exams').toFixed(1)}
                          </td>
                          <td className="py-2 px-3 text-center font-mono-numeric">
                            {calculateCriterionCumulative(selectedStudentForBoleta.id, 'attendance').toFixed(1)}
                          </td>
                          <td className="py-2 px-3 text-center font-mono-numeric">
                            {calculateCriterionCumulative(selectedStudentForBoleta.id, 'participation').toFixed(1)}
                          </td>
                          <td className="py-2 px-3 text-center font-mono-numeric">
                            {calculateCriterionCumulative(selectedStudentForBoleta.id, 'selfEval').toFixed(1)}
                          </td>
                          <td className="py-2 px-3 text-center font-bold font-mono-numeric text-primary bg-primary/5">
                            {pAvg.toFixed(1)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Teacher Observations & Feedback */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-secondary">rate_review</span>
                  <span>Observaciones y Recomendaciones del Docente</span>
                </label>
                <span className="text-[11px] text-on-surface-variant">Visible en boleta impresa</span>
              </div>
              <textarea
                rows={3}
                value={editingNote}
                onChange={(e) => setEditingNote(e.target.value)}
                placeholder="Escribe comentarios formativos, fortalezas y áreas de oportunidad para el alumno..."
                className="w-full p-2.5 text-xs bg-surface-container-low rounded-xl border border-[#CBD5E1] focus:outline-none focus:border-secondary"
              />
            </div>

            {/* Official Signatures Mockup */}
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#E2E8F0] text-center text-[10px] text-on-surface-variant">
              <div className="flex flex-col items-center">
                <div className="w-40 border-b border-dashed border-[#94A3B8] pb-4 mb-1">
                  <span className="font-script text-xs text-primary italic font-serif">Prof. Titular</span>
                </div>
                <span className="font-bold text-on-surface">Docente Titular de la Asignatura</span>
                <span className="text-slate-500">{institutionInfo?.name || 'AulaGrade Sistema Académico'}</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-40 border-b border-dashed border-[#94A3B8] pb-4 mb-1 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-base">verified</span>
                </div>
                <span className="font-bold text-on-surface">
                  {institutionInfo?.directorName || 'Dirección y Control Escolar'}
                </span>
                <span className="text-[9px] text-slate-500">
                  {institutionInfo?.directorTitle || 'Directora General de Control Escolar'}
                </span>
                <span className="font-mono text-[9px] mt-0.5 text-slate-400">
                  Folio: {institutionInfo?.cctCode || 'AG'}-{currentGroup.code}-{selectedStudentForBoleta.matricula}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 mt-5 pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => {
                  setTeacherNotes(prev => ({
                    ...prev,
                    [selectedStudentForBoleta.id]: editingNote
                  }));
                  setSelectedStudentForBoleta(null);
                }}
                className="px-4 py-2 bg-surface-container-high text-on-surface rounded-lg text-xs font-semibold hover:bg-surface-container cursor-pointer"
              >
                Cerrar y Guardar Nota
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTeacherNotes(prev => ({
                      ...prev,
                      [selectedStudentForBoleta.id]: editingNote
                    }));
                    window.print();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold hover:bg-primary-container shadow-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                  <span>Imprimir Boleta Oficial</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
