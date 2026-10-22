/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Group, AssignmentGrade } from '../types';
import { INITIAL_ASSIGNMENTS, INITIAL_STUDENT_SCORES } from '../data/mockData';

interface GradebookViewProps {
  groups: Group[];
  selectedGroupId?: string;
  onSelectGroup: (groupId: string) => void;
  onOpenCreateGroup: () => void;
  assignments?: AssignmentGrade[];
  setAssignments?: React.Dispatch<React.SetStateAction<AssignmentGrade[]>>;
  scores?: Record<string, Record<string, number>>;
  setScores?: React.Dispatch<React.SetStateAction<Record<string, Record<string, number>>>>;
  onNavigateToFinalGrades?: () => void;
}

export const GradebookView: React.FC<GradebookViewProps> = ({
  groups,
  selectedGroupId,
  onSelectGroup,
  onOpenCreateGroup,
  assignments: externalAssignments,
  setAssignments: externalSetAssignments,
  scores: externalScores,
  setScores: externalSetScores,
  onNavigateToFinalGrades,
}) => {
  const currentGroup = groups.find((g) => g.id === selectedGroupId) || groups[0];

  const [internalAssignments, setInternalAssignments] = useState<AssignmentGrade[]>(INITIAL_ASSIGNMENTS);
  const [internalScores, setInternalScores] = useState<Record<string, Record<string, number>>>(INITIAL_STUDENT_SCORES);

  const assignments = externalAssignments ?? internalAssignments;
  const setAssignments = externalSetAssignments ?? setInternalAssignments;
  const scores = externalScores ?? internalScores;
  const setScores = externalSetScores ?? setInternalScores;

  const [editingCell, setEditingCell] = useState<{ studentId: string; assignmentId: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<AssignmentGrade | null>(null);
  const [assignmentToEdit, setAssignmentToEdit] = useState<AssignmentGrade | null>(null);
  const [newAsgName, setNewAsgName] = useState('');
  const [newAsgCategory, setNewAsgCategory] = useState<'homework' | 'exams' | 'attendance' | 'participation' | 'selfEval'>('homework');
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState<number | 'all'>('all');
  const [newAsgPeriod, setNewAsgPeriod] = useState<number>(1);

  if (!currentGroup) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-on-surface-variant">No hay grupos disponibles para tu cuenta docente.</p>
        <button 
          onClick={onOpenCreateGroup}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold"
        >
          Dar de Alta Nuevo Grupo
        </button>
      </div>
    );
  }

  const { criteria, students } = currentGroup;
  const weights = criteria.weights;
  const structure = currentGroup.criteria.evaluationStructure || 'parciales';
  const numPeriods = currentGroup.criteria.numberOfPeriods || 3;

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

  const visibleAssignments = groupAssignments.filter((a) => {
    if (selectedPeriodFilter === 'all') return true;
    return a.periodIndex === selectedPeriodFilter || !a.periodIndex;
  });

  // Calculate weighted average for a specific period
  const calculatePeriodAverage = (studentId: string, periodIdx: number) => {
    const studentScores = scores[studentId] || {};
    const periodAssignments = groupAssignments.filter((a) => a.periodIndex === periodIdx);
    if (periodAssignments.length === 0) return 10.0;

    const getCatPeriodAvg = (category: 'homework' | 'exams' | 'attendance' | 'participation' | 'selfEval') => {
      const catAsgs = periodAssignments.filter((a) => a.category === category);
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

  // Calculate final cumulative grade
  const calculateStudentFinalGrade = (studentId: string) => {
    if (structure === 'ciclo_unico') {
      return calculateStudentAverage(studentId);
    }
    let sum = 0;
    for (let p = 1; p <= numPeriods; p++) {
      sum += calculatePeriodAverage(studentId, p);
    }
    return Math.round((sum / numPeriods) * 10) / 10;
  };

  // Calculate overall weighted average for a student (all assignments of current group)
  const calculateStudentAverage = (studentId: string) => {
    const studentScores = scores[studentId] || {};

    const getCategoryAvg = (category: 'homework' | 'exams' | 'attendance' | 'participation' | 'selfEval') => {
      const catAssignments = groupAssignments.filter((a) => a.category === category);
      if (catAssignments.length === 0) return 10;
      let sum = 0;
      let count = 0;
      for (const a of catAssignments) {
        if (studentScores[a.id] !== undefined) {
          sum += studentScores[a.id];
          count++;
        }
      }
      return count > 0 ? sum / count : 0;
    };

    const hwAvg = getCategoryAvg('homework');
    const examAvg = getCategoryAvg('exams');
    const attAvg = getCategoryAvg('attendance');
    const partAvg = getCategoryAvg('participation');
    const selfAvg = getCategoryAvg('selfEval');

    const totalWeighted = (
      (hwAvg * weights.homework) +
      (examAvg * weights.exams) +
      (attAvg * weights.attendance) +
      (partAvg * weights.participation) +
      (selfAvg * weights.selfEval)
    ) / 100;

    return Math.round(totalWeighted * 10) / 10;
  };

  // Handle cell edit save
  const handleCellBlurOrEnter = (studentId: string, assignmentId: string) => {
    const num = parseFloat(editValue);
    if (!isNaN(num)) {
      const clamped = Math.min(10, Math.max(0, Math.round(num * 10) / 10));
      setScores(prev => ({
        ...prev,
        [studentId]: {
          ...(prev[studentId] || {}),
          [assignmentId]: clamped
        }
      }));
    }
    setEditingCell(null);
  };

  // Add assignment scoped to currentGroup
  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsgName.trim()) return;
    const newAsg: AssignmentGrade = {
      id: `asg-${currentGroup.id}-${Date.now()}`,
      groupId: currentGroup.id,
      name: newAsgName.trim(),
      category: newAsgCategory,
      periodIndex: newAsgPeriod,
      maxScore: 10
    };
    setAssignments(prev => [...prev, newAsg]);
    // Pre-populate with reasonable default
    setScores(prev => {
      const next = { ...prev };
      students.forEach(s => {
        if (!next[s.id]) next[s.id] = {};
        next[s.id][newAsg.id] = 8.5;
      });
      return next;
    });
    setNewAsgName('');
    setShowAddAssignmentModal(false);
  };

  // Confirm delete assignment
  const handleConfirmDelete = () => {
    if (!assignmentToDelete) return;
    const asgId = assignmentToDelete.id;
    setAssignments(prev => prev.filter(a => a.id !== asgId));
    setScores(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(studentId => {
        if (next[studentId] && next[studentId][asgId] !== undefined) {
          const copy = { ...next[studentId] };
          delete copy[asgId];
          next[studentId] = copy;
        }
      });
      return next;
    });
    setAssignmentToDelete(null);
  };

  // Save edit assignment
  const handleSaveEditAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentToEdit || !assignmentToEdit.name.trim()) return;
    setAssignments(prev => prev.map(a => a.id === assignmentToEdit.id ? assignmentToEdit : a));
    setAssignmentToEdit(null);
  };

  // Clear all preset assignments for currentGroup (start clean)
  const handleClearGroupAssignments = () => {
    if (window.confirm(`¿Deseas eliminar todas las ${groupAssignments.length} actividades registradas de ${currentGroup.name}?\n\nEsta acción borrará las tareas y sus notas asociadas para que puedas comenzar completamente en blanco.`)) {
      const asgIdsToRemove = new Set(groupAssignments.map(a => a.id));
      setAssignments(prev => prev.filter(a => !asgIdsToRemove.has(a.id)));
      setScores(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(studentId => {
          if (next[studentId]) {
            const copy = { ...next[studentId] };
            asgIdsToRemove.forEach(id => delete copy[id]);
            next[studentId] = copy;
          }
        });
        return next;
      });
    }
  };

  // Generate suggested clean assignments if empty
  const handleGenerateStarterTemplate = () => {
    const newAsgs: AssignmentGrade[] = [];
    const newScoresPatch: Record<string, Record<string, number>> = {};
    
    for (let p = 1; p <= numPeriods; p++) {
      const t1Id = `asg-${currentGroup.id}-p${p}-t1-${Date.now()}`;
      const exId = `asg-${currentGroup.id}-p${p}-ex-${Date.now()}`;
      const partId = `asg-${currentGroup.id}-p${p}-part-${Date.now()}`;
      
      newAsgs.push(
        { id: t1Id, groupId: currentGroup.id, name: `Tarea 1 (P${p})`, category: 'homework', periodIndex: p, maxScore: 10 },
        { id: exId, groupId: currentGroup.id, name: `Examen (P${p})`, category: 'exams', periodIndex: p, maxScore: 10 },
        { id: partId, groupId: currentGroup.id, name: `Participación (P${p})`, category: 'participation', periodIndex: p, maxScore: 10 },
      );

      students.forEach(s => {
        if (!newScoresPatch[s.id]) newScoresPatch[s.id] = {};
        newScoresPatch[s.id][t1Id] = 9.0;
        newScoresPatch[s.id][exId] = 8.5;
        newScoresPatch[s.id][partId] = 9.5;
      });
    }

    setAssignments(prev => [...prev, ...newAsgs]);
    setScores(prev => {
      const next = { ...prev };
      students.forEach(s => {
        next[s.id] = { ...(next[s.id] || {}), ...(newScoresPatch[s.id] || {}) };
      });
      return next;
    });
  };

  // Export to CSV
  const exportGradebookCsv = () => {
    let csv = `Matrícula,Estudiante,` + assignments.map(a => `"${a.name}"`).join(',') + `,Promedio Final,Estado\n`;
    students.forEach(s => {
      const avg = calculateStudentAverage(s.id);
      const status = avg >= criteria.minPassingGrade ? 'Aprobado' : (avg >= 6.0 ? 'En Riesgo' : 'Reprobado');
      const studentScores = scores[s.id] || {};
      const scoreCols = assignments.map(a => studentScores[a.id] ?? '-').join(',');
      csv += `${s.matricula},"${s.name}",${scoreCols},${avg},${status}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Cuaderno_Notas_${currentGroup.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fill missing scores with realistic test values
  const fillSampleScores = () => {
    setScores(prev => {
      const next = { ...prev };
      students.forEach(s => {
        if (!next[s.id]) next[s.id] = {};
        assignments.forEach(a => {
          if (next[s.id][a.id] === undefined) {
            next[s.id][a.id] = Math.round((7.2 + Math.random() * 2.6) * 10) / 10;
          }
        });
      });
      return next;
    });
  };

  // Class stats
  const classAverages = students.map(s => calculateStudentAverage(s.id));
  const overallAvg = classAverages.length > 0 
    ? (classAverages.reduce((a, b) => a + b, 0) / classAverages.length).toFixed(1) 
    : '0.0';
  const passingCount = classAverages.filter(a => a >= criteria.minPassingGrade).length;
  const passingRate = students.length > 0 
    ? Math.round((passingCount / students.length) * 100) 
    : 0;

  return (
    <div className="flex flex-col w-full pb-16 px-space-lg pt-space-lg">
      {/* Top Header & Group Selector */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-lg border-b border-[#E2E8F0]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
            <span className="material-symbols-outlined text-sm">edit_note</span>
            <span>Matriz de Evaluación Continua</span>
            <span>•</span>
            <span className="text-secondary font-semibold font-mono-numeric">{currentGroup.academicCycle}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Cuaderno de Notas</h1>
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

        {/* Action Controls */}
        <div className="flex items-center gap-space-sm self-start md:self-auto shrink-0 flex-wrap">
          {onNavigateToFinalGrades && (
            <button
              onClick={onNavigateToFinalGrades}
              className="px-3 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">workspace_premium</span>
              <span>Calificaciones Finales & Boletas</span>
            </button>
          )}

          <button
            onClick={() => setShowAddAssignmentModal(true)}
            className="px-3 py-2 rounded-lg bg-primary-container text-white text-xs font-bold hover:bg-primary transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add_task</span>
            <span>Nueva Actividad</span>
          </button>

          {groupAssignments.length > 0 ? (
            <button
              onClick={handleClearGroupAssignments}
              className="px-3 py-2 rounded-lg bg-surface-container-low text-rose-700 hover:bg-rose-50 border border-rose-200 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Borrar todas las actividades de esta materia para comenzar en blanco"
            >
              <span className="material-symbols-outlined text-base text-rose-600">delete_sweep</span>
              <span>Limpiar Actividades</span>
            </button>
          ) : (
            <button
              onClick={handleGenerateStarterTemplate}
              className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Generar tareas base sugeridas para este grupo"
            >
              <span className="material-symbols-outlined text-base text-emerald-600">playlist_add</span>
              <span>Plantilla Sugerida</span>
            </button>
          )}

          <button
            onClick={fillSampleScores}
            className="px-3 py-2 rounded-lg bg-surface-container-low text-on-surface text-xs font-semibold hover:bg-surface-container transition-colors flex items-center gap-1.5 shadow-sm border border-[#E2E8F0] cursor-pointer"
            title="Rellenar calificaciones faltantes con valores de prueba"
          >
            <span className="material-symbols-outlined text-base text-secondary">auto_awesome</span>
            <span>Simular Notas</span>
          </button>

          <button
            onClick={exportGradebookCsv}
            className="px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface text-xs font-semibold hover:bg-surface-container-low transition-colors flex items-center gap-1.5 shadow-sm border border-[#E2E8F0] cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Exportar CSV</span>
          </button>
        </div>
      </header>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md py-space-md">
        <div className="bg-surface-container-lowest p-3 rounded-lg border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Promedio de Grupo</span>
            <p className="text-xl font-bold text-primary font-mono-numeric mt-0.5">{overallAvg} / 10</p>
          </div>
          <span className="material-symbols-outlined text-secondary text-2xl">analytics</span>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded-lg border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Tasa de Aprobación</span>
            <p className="text-xl font-bold text-emerald-600 font-mono-numeric mt-0.5">{passingRate}% ({passingCount}/{students.length})</p>
          </div>
          <span className="material-symbols-outlined text-emerald-600 text-2xl">verified</span>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded-lg border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Mínimo Aprobatorio</span>
            <p className="text-xl font-bold text-on-surface font-mono-numeric mt-0.5">{criteria.minPassingGrade.toFixed(1)}</p>
          </div>
          <span className="material-symbols-outlined text-outline text-2xl">grade</span>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded-lg border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Cortes de Evaluación</span>
            <p className="text-xs font-bold text-secondary mt-1">
              {structure === 'trimestres' ? `${numPeriods} Trimestres (Secundaria)` :
               structure === 'parciales' ? `${numPeriods} Parciales (Prepa/Univ)` :
               structure === 'bimestres' ? `${numPeriods} Bimestres` :
               structure === 'cuatrimestres' ? `${numPeriods} Cuatrimestres` :
               structure === 'periodos' ? `${numPeriods} Periodos Modulares` : 'Ciclo Continuo'}
            </p>
          </div>
          <span className="material-symbols-outlined text-secondary text-2xl">calendar_view_week</span>
        </div>
      </div>

      {/* Period / Trimestre Filter Tabs */}
      {structure !== 'ciclo_unico' && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 text-xs">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider pr-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-secondary">filter_alt</span>
            <span>Corte:</span>
          </span>
          <button
            onClick={() => setSelectedPeriodFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
              selectedPeriodFilter === 'all'
                ? 'bg-primary-container text-on-primary border-primary-container shadow-xs'
                : 'bg-surface-container-low text-on-surface border-[#CBD5E1] hover:bg-surface-container'
            }`}
          >
            Todos ({groupAssignments.length})
          </button>
          {Array.from({ length: numPeriods }, (_, i) => i + 1).map((idx) => {
            const countInPeriod = groupAssignments.filter(a => a.periodIndex === idx).length;
            return (
              <button
                key={idx}
                onClick={() => setSelectedPeriodFilter(idx)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                  selectedPeriodFilter === idx
                    ? 'bg-primary-container text-on-primary border-primary-container shadow-xs'
                    : 'bg-surface-container-low text-on-surface border-[#CBD5E1] hover:bg-surface-container'
                }`}
              >
                {getPeriodName(idx)} {countInPeriod > 0 && `(${countInPeriod})`}
              </button>
            );
          })}
        </div>
      )}

      {/* Isolated Period Banner when filtering */}
      {selectedPeriodFilter !== 'all' && (
        <div className="mb-3 p-3 bg-secondary/10 border border-secondary/30 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs animate-fadeIn">
          <div className="flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-secondary text-base">filter_list</span>
            <span>
              Corte Aislado: <strong>{getPeriodName(selectedPeriodFilter)}</strong> ({visibleAssignments.length} actividades). 
              <span className="text-on-surface-variant ml-1 font-normal">Las actividades de los demás periodos están cortadas para enfoque docente.</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            {Number(selectedPeriodFilter) > 1 && (
              <button
                onClick={() => setSelectedPeriodFilter(Number(selectedPeriodFilter) - 1)}
                className="px-2.5 py-1 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-lg border border-[#CBD5E1] text-[11px] font-bold transition-colors cursor-pointer"
              >
                ← {getPeriodName(Number(selectedPeriodFilter) - 1)}
              </button>
            )}
            {Number(selectedPeriodFilter) < numPeriods && (
              <button
                onClick={() => setSelectedPeriodFilter(Number(selectedPeriodFilter) + 1)}
                className="px-2.5 py-1 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-lg border border-[#CBD5E1] text-[11px] font-bold transition-colors cursor-pointer"
              >
                {getPeriodName(Number(selectedPeriodFilter) + 1)} →
              </button>
            )}
            <button
              onClick={() => setSelectedPeriodFilter('all')}
              className="px-2.5 py-1 bg-surface-container-high hover:bg-surface-container text-primary rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
            >
              Ver Todos los Periodos
            </button>
          </div>
        </div>
      )}

      {/* Gradebook Matrix Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-[#E2E8F0] overflow-hidden flex flex-col">
        <div className="p-space-sm bg-surface-container-low border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-on-surface font-bold">Edición Rápida:</span>
            <span className="text-[11px] text-on-surface-variant">Haz clic sobre cualquier celda para editar calificaciones directamente.</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <span className="flex items-center gap-1 text-[#065F46]">
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span> Aprobado (≥ {criteria.minPassingGrade.toFixed(1)})
            </span>
            <span className="flex items-center gap-1 text-[#92400E]">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span> En Riesgo (6.0 - 6.9)
            </span>
            <span className="flex items-center gap-1 text-[#991B1B]">
              <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span> Reprobado (&lt; 6.0)
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              {/* Grouping header when viewing all periods */}
              {selectedPeriodFilter === 'all' && structure !== 'ciclo_unico' && (
                <tr className="bg-surface-container-high/40 border-b border-[#CBD5E1] text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                  <th colSpan={2} className="py-2 px-3 border-r border-[#CBD5E1] text-left">
                    Datos del Alumno
                  </th>
                  {Array.from({ length: numPeriods }, (_, i) => i + 1).map((pIdx) => {
                    const pAsgs = assignments.filter(a => a.periodIndex === pIdx);
                    return (
                      <th
                        key={pIdx}
                        colSpan={pAsgs.length + 1}
                        className="py-2 px-3 text-center border-r-4 border-slate-300 bg-secondary/5 text-secondary"
                      >
                        {getPeriodName(pIdx)} • {pAsgs.length} Actividades + Subtotal
                      </th>
                    );
                  })}
                  <th colSpan={2} className="py-2 px-3 text-center bg-surface-container-low text-primary">
                    Consolidado Final
                  </th>
                </tr>
              )}

              <tr className="bg-surface-container-high/60 border-b border-[#CBD5E1] text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3 sticky left-0 bg-surface-container-high/95 z-20 w-32 border-r border-[#CBD5E1]">
                  Matrícula
                </th>
                <th className="py-2.5 px-3 sticky left-32 bg-surface-container-high/95 z-20 min-w-56 border-r border-[#CBD5E1]">
                  Estudiante
                </th>

                {/* If single period selected */}
                {selectedPeriodFilter !== 'all' ? (
                  <>
                    {visibleAssignments.length > 0 ? (
                      visibleAssignments.map((asg) => (
                        <th key={asg.id} className="py-2.5 px-3 text-center min-w-36 border-r border-[#CBD5E1] bg-surface-container-high/40 hover:bg-surface-container-high transition-colors group/th">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center justify-between w-full gap-1">
                              <span className="font-bold text-on-surface truncate text-xs flex-1 text-center" title={asg.name}>
                                {asg.name}
                              </span>
                              <div className="flex items-center gap-0.5 opacity-60 group-hover/th:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAssignmentToEdit({ ...asg });
                                  }}
                                  className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer"
                                  title={`Editar ${asg.name}`}
                                >
                                  <span className="material-symbols-outlined text-[13px]">edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAssignmentToDelete(asg);
                                  }}
                                  className="p-1 rounded hover:bg-rose-100 text-slate-400 hover:text-rose-600 cursor-pointer"
                                  title={`Eliminar ${asg.name}`}
                                >
                                  <span className="material-symbols-outlined text-[13px]">delete</span>
                                </button>
                              </div>
                            </div>
                            <span className="text-[10px] text-secondary font-mono-numeric mt-0.5">
                              {asg.category === 'homework' ? `Trabajos (${weights.homework}%)` :
                               asg.category === 'exams' ? `Examen (${weights.exams}%)` :
                               asg.category === 'attendance' ? `Asistencia (${weights.attendance}%)` :
                               asg.category === 'participation' ? `Part. (${weights.participation}%)` : `Auto. (${weights.selfEval}%)`}
                            </span>
                            {asg.periodIndex && (
                              <span className="text-[9px] text-outline font-medium mt-0.5">
                                {getPeriodName(asg.periodIndex)}
                              </span>
                            )}
                          </div>
                        </th>
                      ))
                    ) : (
                      <th className="py-2.5 px-4 text-center min-w-44 border-r border-[#CBD5E1] bg-amber-50/40 text-amber-800 text-xs font-medium italic">
                        Sin actividades en este corte
                      </th>
                    )}
                    {/* Period Subtotal Column */}
                    <th className="py-2.5 px-3 text-center font-bold text-secondary min-w-28 border-r-2 border-secondary bg-secondary/10">
                      <div className="flex flex-col items-center">
                        <span>Subtotal</span>
                        <span className="text-[9px] text-secondary font-normal">{getPeriodName(selectedPeriodFilter)}</span>
                      </div>
                    </th>
                  </>
                ) : (
                  /* If all periods selected: group by period with subtotal divider */
                  Array.from({ length: numPeriods }, (_, i) => i + 1).map((pIdx) => {
                    const pAsgs = groupAssignments.filter(a => a.periodIndex === pIdx);
                    return (
                      <React.Fragment key={pIdx}>
                        {pAsgs.length > 0 ? (
                          pAsgs.map((asg) => (
                            <th key={asg.id} className="py-2.5 px-3 text-center min-w-36 border-r border-[#CBD5E1] bg-surface-container-high/40 hover:bg-surface-container-high transition-colors group/th">
                              <div className="flex flex-col items-center">
                                <div className="flex items-center justify-between w-full gap-1">
                                  <span className="font-bold text-on-surface truncate text-xs flex-1 text-center" title={asg.name}>
                                    {asg.name}
                                  </span>
                                  <div className="flex items-center gap-0.5 opacity-60 group-hover/th:opacity-100 transition-opacity">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setAssignmentToEdit({ ...asg });
                                      }}
                                      className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer"
                                      title={`Editar ${asg.name}`}
                                    >
                                      <span className="material-symbols-outlined text-[13px]">edit</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setAssignmentToDelete(asg);
                                      }}
                                      className="p-1 rounded hover:bg-rose-100 text-slate-400 hover:text-rose-600 cursor-pointer"
                                      title={`Eliminar ${asg.name}`}
                                    >
                                      <span className="material-symbols-outlined text-[13px]">delete</span>
                                    </button>
                                  </div>
                                </div>
                                <span className="text-[10px] text-secondary font-mono-numeric mt-0.5">
                                  {asg.category === 'homework' ? `Trabajos (${weights.homework}%)` :
                                   asg.category === 'exams' ? `Examen (${weights.exams}%)` :
                                   asg.category === 'attendance' ? `Asistencia (${weights.attendance}%)` :
                                   asg.category === 'participation' ? `Part. (${weights.participation}%)` : `Auto. (${weights.selfEval}%)`}
                                </span>
                                <span className="text-[9px] text-outline font-medium mt-0.5">
                                  {getPeriodName(pIdx)}
                                </span>
                              </div>
                            </th>
                          ))
                        ) : (
                          <th key={`empty-${pIdx}`} className="py-2.5 px-3 text-center min-w-32 border-r border-[#CBD5E1] bg-slate-50 text-slate-400 text-[10px] italic">
                            Sin tareas P{pIdx}
                          </th>
                        )}
                        {/* Period Subtotal & Delimiter Column */}
                        <th className="py-2.5 px-3 text-center font-bold text-secondary min-w-28 border-r-4 border-slate-300 bg-secondary/10">
                          <div className="flex flex-col items-center">
                            <span>Subtotal</span>
                            <span className="text-[9px] text-secondary font-normal">{getPeriodName(pIdx)}</span>
                          </div>
                        </th>
                      </React.Fragment>
                    );
                  })
                )}

                <th className="py-2.5 px-3 text-center font-bold text-primary min-w-28 border-r border-[#CBD5E1] bg-surface-container-low">
                  Promedio Final
                </th>
                <th className="py-2.5 px-3 text-center font-bold text-on-surface min-w-28">
                  Estatus
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {students.map((student, idx) => {
                const studentScores = scores[student.id] || {};
                const finalAvg = calculateStudentFinalGrade(student.id);
                const isPassing = finalAvg >= criteria.minPassingGrade;
                const isAtRisk = !isPassing && finalAvg >= 6.0;

                return (
                  <tr key={student.id} className={`hover:bg-surface-container-low/50 transition-colors ${idx % 2 === 1 ? 'bg-surface-container-low/20' : ''}`}>
                    {/* Matrícula */}
                    <td className="py-2 px-3 sticky left-0 bg-surface-container-lowest z-10 font-mono-numeric font-semibold text-xs text-on-surface border-r border-[#E2E8F0]">
                      {student.matricula}
                    </td>

                    {/* Estudiante */}
                    <td className="py-2 px-3 sticky left-32 bg-surface-container-lowest z-10 border-r border-[#E2E8F0]">
                      <div className="flex items-center gap-2">
                        {student.avatarUrl ? (
                          <img src={student.avatarUrl} alt={student.name} className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-[#E2E8F0]" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-mono-numeric text-[10px] font-bold shrink-0">
                            {student.initials || student.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="font-semibold text-xs text-on-surface truncate">{student.name}</span>
                      </div>
                    </td>

                    {/* If single period selected */}
                    {selectedPeriodFilter !== 'all' ? (
                      <>
                        {visibleAssignments.length > 0 ? (
                          visibleAssignments.map((asg) => {
                            const score = studentScores[asg.id];
                            const isEditing = editingCell?.studentId === student.id && editingCell?.assignmentId === asg.id;

                            return (
                              <td 
                                key={asg.id} 
                                onClick={() => {
                                  setEditingCell({ studentId: student.id, assignmentId: asg.id });
                                  setEditValue(score !== undefined ? String(score) : '');
                                }}
                                className="py-1 px-2 text-center border-r border-[#E2E8F0] cursor-pointer hover:bg-surface-container-high/40 transition-colors"
                              >
                                {isEditing ? (
                                  <input
                                    autoFocus
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="10"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onBlur={() => handleCellBlurOrEnter(student.id, asg.id)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleCellBlurOrEnter(student.id, asg.id);
                                      if (e.key === 'Escape') setEditingCell(null);
                                    }}
                                    className="w-16 h-7 text-center font-mono-numeric text-xs font-bold text-primary bg-white border-2 border-secondary rounded focus:outline-none shadow-sm"
                                  />
                                ) : (
                                  <span className="font-mono-numeric text-xs font-semibold text-on-surface">
                                    {score !== undefined ? score.toFixed(1) : '-'}
                                  </span>
                                )}
                              </td>
                            );
                          })
                        ) : (
                          <td className="py-2 px-3 text-center text-slate-400 text-xs border-r border-[#E2E8F0] italic">
                            -
                          </td>
                        )}
                        {/* Period Subtotal Cell */}
                        <td className="py-2 px-3 text-center font-mono-numeric text-xs font-bold border-r-2 border-secondary bg-secondary/10 text-secondary">
                          {calculatePeriodAverage(student.id, selectedPeriodFilter).toFixed(1)}
                        </td>
                      </>
                    ) : (
                      /* If all periods selected: group by period with subtotal divider */
                      Array.from({ length: numPeriods }, (_, i) => i + 1).map((pIdx) => {
                        const pAsgs = groupAssignments.filter(a => a.periodIndex === pIdx);
                        const pSubtotal = calculatePeriodAverage(student.id, pIdx);
                        return (
                          <React.Fragment key={pIdx}>
                            {pAsgs.length > 0 ? (
                              pAsgs.map((asg) => {
                                const score = studentScores[asg.id];
                                const isEditing = editingCell?.studentId === student.id && editingCell?.assignmentId === asg.id;

                                return (
                                  <td 
                                    key={asg.id} 
                                    onClick={() => {
                                      setEditingCell({ studentId: student.id, assignmentId: asg.id });
                                      setEditValue(score !== undefined ? String(score) : '');
                                    }}
                                    className="py-1 px-2 text-center border-r border-[#E2E8F0] cursor-pointer hover:bg-surface-container-high/40 transition-colors"
                                  >
                                    {isEditing ? (
                                      <input
                                        autoFocus
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="10"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onBlur={() => handleCellBlurOrEnter(student.id, asg.id)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleCellBlurOrEnter(student.id, asg.id);
                                          if (e.key === 'Escape') setEditingCell(null);
                                        }}
                                        className="w-16 h-7 text-center font-mono-numeric text-xs font-bold text-primary bg-white border-2 border-secondary rounded focus:outline-none shadow-sm"
                                      />
                                    ) : (
                                      <span className="font-mono-numeric text-xs font-semibold text-on-surface">
                                        {score !== undefined ? score.toFixed(1) : '-'}
                                      </span>
                                    )}
                                  </td>
                                );
                              })
                            ) : (
                              <td key={`empty-cell-${pIdx}`} className="py-2 px-3 text-center text-slate-300 text-xs border-r border-[#E2E8F0]">
                                -
                              </td>
                            )}
                            {/* Period Subtotal & Delimiter Cell */}
                            <td className="py-2 px-3 text-center font-mono-numeric text-xs font-bold border-r-4 border-slate-300 bg-secondary/10 text-secondary">
                              {pSubtotal.toFixed(1)}
                            </td>
                          </React.Fragment>
                        );
                      })
                    )}

                    {/* Promedio Final */}
                    <td className="py-2 px-3 text-center font-mono-numeric text-sm font-bold border-r border-[#E2E8F0] bg-surface-container-low/40">
                      <span className={isPassing ? 'text-primary' : isAtRisk ? 'text-[#92400E]' : 'text-error'}>
                        {finalAvg.toFixed(1)}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-2 px-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        isPassing 
                          ? 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]' 
                          : isAtRisk 
                          ? 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]' 
                          : 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]'
                      }`}>
                        {isPassing ? 'Aprobado' : isAtRisk ? 'En Riesgo' : 'Reprobado'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Assignment */}
      {showAddAssignmentModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">add_task</span>
                <span>Crear Nueva Columna de Evaluación</span>
              </h3>
              <button 
                onClick={() => setShowAddAssignmentModal(false)}
                className="text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleAddAssignment} className="flex flex-col gap-3 pt-4">
              <div>
                <label className="text-xs font-semibold text-on-surface">Nombre de la Actividad *</label>
                <input
                  required
                  value={newAsgName}
                  onChange={(e) => setNewAsgName(e.target.value)}
                  placeholder="Ej. T4: Ecuación de Schrödinger"
                  className="w-full h-9 px-3 text-xs bg-surface-container-low rounded border border-[#CBD5E1] mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface">Categoría de Ponderación</label>
                <select
                  value={newAsgCategory}
                  onChange={(e) => setNewAsgCategory(e.target.value as any)}
                  className="w-full h-9 px-3 text-xs bg-surface-container-low rounded border border-[#CBD5E1] mt-1 cursor-pointer"
                >
                  <option value="homework">Tareas y Trabajos ({weights.homework}%)</option>
                  <option value="exams">Exámenes y Pruebas ({weights.exams}%)</option>
                  <option value="attendance">Asistencia y Puntualidad ({weights.attendance}%)</option>
                  <option value="participation">Participación y Talleres ({weights.participation}%)</option>
                  <option value="selfEval">Autoevaluación ({weights.selfEval}%)</option>
                </select>
              </div>

              {structure !== 'ciclo_unico' && (
                <div>
                  <label className="text-xs font-semibold text-on-surface">Corte Evaluativo / Periodo</label>
                  <select
                    value={newAsgPeriod}
                    onChange={(e) => setNewAsgPeriod(Number(e.target.value))}
                    className="w-full h-9 px-3 text-xs bg-surface-container-low rounded border border-[#CBD5E1] mt-1 cursor-pointer font-medium"
                  >
                    {Array.from({ length: numPeriods }, (_, i) => i + 1).map((idx) => (
                      <option key={idx} value={idx}>{getPeriodName(idx)}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddAssignmentModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold bg-surface-container-high rounded text-on-surface"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-primary text-on-primary rounded hover:bg-primary-container"
                >
                  Crear Columna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Actividad */}
      {assignmentToEdit && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl shadow-xl border border-[#CBD5E1] p-5 w-full max-w-md animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">edit_note</span>
                <h3 className="font-bold text-sm text-on-surface">Editar Actividad</h3>
              </div>
              <button 
                onClick={() => setAssignmentToEdit(null)}
                className="text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEditAssignment} className="flex flex-col gap-3 pt-4">
              <div>
                <label className="text-xs font-semibold text-on-surface">Nombre de la Actividad *</label>
                <input
                  required
                  value={assignmentToEdit.name}
                  onChange={(e) => setAssignmentToEdit({ ...assignmentToEdit, name: e.target.value })}
                  className="w-full h-9 px-3 text-xs bg-surface-container-low rounded border border-[#CBD5E1] mt-1 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface">Categoría de Ponderación</label>
                <select
                  value={assignmentToEdit.category}
                  onChange={(e) => setAssignmentToEdit({ ...assignmentToEdit, category: e.target.value as any })}
                  className="w-full h-9 px-3 text-xs bg-surface-container-low rounded border border-[#CBD5E1] mt-1 cursor-pointer font-medium"
                >
                  <option value="homework">Tareas y Trabajos ({weights.homework}%)</option>
                  <option value="exams">Exámenes y Pruebas ({weights.exams}%)</option>
                  <option value="attendance">Asistencia y Puntualidad ({weights.attendance}%)</option>
                  <option value="participation">Participación y Talleres ({weights.participation}%)</option>
                  <option value="selfEval">Autoevaluación ({weights.selfEval}%)</option>
                </select>
              </div>

              {structure !== 'ciclo_unico' && (
                <div>
                  <label className="text-xs font-semibold text-on-surface">Corte Evaluativo / Periodo</label>
                  <select
                    value={assignmentToEdit.periodIndex || 1}
                    onChange={(e) => setAssignmentToEdit({ ...assignmentToEdit, periodIndex: Number(e.target.value) })}
                    className="w-full h-9 px-3 text-xs bg-surface-container-low rounded border border-[#CBD5E1] mt-1 cursor-pointer font-medium"
                  >
                    {Array.from({ length: numPeriods }, (_, i) => i + 1).map((idx) => (
                      <option key={idx} value={idx}>{getPeriodName(idx)}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setAssignmentToEdit(null)}
                  className="px-3 py-1.5 text-xs font-semibold bg-surface-container-high rounded text-on-surface cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-primary text-on-primary rounded hover:bg-primary-container cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmación para Eliminar Actividad */}
      {assignmentToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 p-6 w-full max-w-sm animate-fadeIn">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">delete_forever</span>
            </div>
            <h3 className="font-bold text-base text-slate-900">¿Eliminar actividad?</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              ¿Estás seguro de que deseas eliminar permanentemente <strong>&ldquo;{assignmentToDelete.name}&rdquo;</strong>?
            </p>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 mt-3 flex items-start gap-2">
              <span className="material-symbols-outlined text-sm text-amber-600 shrink-0 mt-0.5">warning</span>
              <span>Esta acción borrará la columna y todas las calificaciones capturadas para esta actividad en los alumnos del grupo.</span>
            </div>

            <div className="flex justify-end gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setAssignmentToDelete(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                <span>Sí, Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
