/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Group, AssignmentGrade } from '../types';
import { deleteAssignmentFromCloud, deleteAssignmentsFromCloud } from '../firebase';

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
  onNavigateToAttendance?: () => void;
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
  onNavigateToAttendance,
}) => {
  const currentGroup = groups.find((g) => g.id === selectedGroupId) || groups[0];

  const [internalAssignments, setInternalAssignments] = useState<AssignmentGrade[]>([]);
  const [internalScores, setInternalScores] = useState<Record<string, Record<string, number>>>({});

  const assignments = externalAssignments ?? internalAssignments;
  const setAssignments = externalSetAssignments ?? setInternalAssignments;
  const scores = externalScores ?? internalScores;
  const setScores = externalSetScores ?? setInternalScores;

  // By default, focus on the 1st period
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState<number | 'all'>(1);
  // View mode inside a period: summary of 6 criteria vs detailed task-by-task columns
  const [viewSubMode, setViewSubMode] = useState<'criteria_summary' | 'tasks_detail'>('criteria_summary');

  const [editingCell, setEditingCell] = useState<{
    studentId: string;
    category?: 'homework' | 'exams' | 'attendance' | 'participation' | 'projects' | 'selfEval';
    assignmentId?: string;
    periodIdx?: number;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [toastFeedback, setToastFeedback] = useState<string | null>(null);

  const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(false);
  const [showClearPeriodModal, setShowClearPeriodModal] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<AssignmentGrade | null>(null);
  const [assignmentToEdit, setAssignmentToEdit] = useState<AssignmentGrade | null>(null);
  const [newAsgName, setNewAsgName] = useState('');
  const [newAsgCategory, setNewAsgCategory] = useState<'homework' | 'exams' | 'attendance' | 'participation' | 'projects' | 'selfEval'>('homework');
  const [newAsgPeriod, setNewAsgPeriod] = useState<number>(1);

  if (!currentGroup) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-on-surface-variant">No hay grupos disponibles para tu cuenta docente.</p>
        <button 
          onClick={onOpenCreateGroup}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold cursor-pointer"
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

  const activePeriodIdx = typeof selectedPeriodFilter === 'number' ? selectedPeriodFilter : 1;
  const visibleAssignments = groupAssignments.filter((a) => {
    if (selectedPeriodFilter === 'all') return true;
    return a.periodIndex === selectedPeriodFilter || !a.periodIndex;
  });

  // Calculate criterion average for a student in a specific period
  // (unites tasks of this period, or falls back to direct period score, or 10.0)
  const calculatePeriodCriterionAvg = (
    studentId: string,
    periodIdx: number,
    category: 'homework' | 'exams' | 'attendance' | 'participation' | 'projects' | 'selfEval'
  ) => {
    const studentScores = scores[studentId] || {};
    const periodSpecificKey = `cat_${currentGroup.id}_p${periodIdx}_${category}`;
    const generalKey = `cat_${currentGroup.id}_${category}`;
    const asgKey = `asg_${currentGroup.id}_p${periodIdx}_${category === 'attendance' ? 'att' : category}`;

    // 1. Look for assignments of this category in this specific period
    const catPeriodAsgs = groupAssignments.filter(
      (a) => a.category === category && a.periodIndex === periodIdx
    );

    if (catPeriodAsgs.length > 0) {
      let sum = 0;
      let count = 0;
      for (const asg of catPeriodAsgs) {
        if (studentScores[asg.id] !== undefined) {
          sum += studentScores[asg.id];
          count++;
        }
      }
      if (count > 0) {
        return Math.round((sum / count) * 10) / 10;
      }
    }

    // 2. Direct period score or attendance sync score
    if (studentScores[periodSpecificKey] !== undefined) {
      return studentScores[periodSpecificKey];
    }
    if (studentScores[asgKey] !== undefined) {
      return studentScores[asgKey];
    }

    // 3. Fallback to general category score
    if (studentScores[generalKey] !== undefined) {
      return studentScores[generalKey];
    }

    return 10.0;
  };

  // Save direct score for a criterion in a specific period
  const handleSavePeriodCriterionScore = (
    studentId: string,
    category: 'homework' | 'exams' | 'attendance' | 'participation' | 'projects' | 'selfEval',
    valStr: string,
    periodIdx: number
  ) => {
    const parsed = parseFloat(valStr);
    if (isNaN(parsed) || parsed < 0 || parsed > 10) {
      setToastFeedback('Ingresa una calificación válida entre 0 y 10.');
      setTimeout(() => setToastFeedback(null), 3000);
      setEditingCell(null);
      return;
    }
    const cleanScore = Math.round(parsed * 10) / 10;
    const periodKey = `cat_${currentGroup.id}_p${periodIdx}_${category}`;
    const directKey = `cat_${currentGroup.id}_${category}`;
    const asgKey = `asg_${currentGroup.id}_p${periodIdx}_${category === 'attendance' ? 'att' : category}`;

    const categoryNames: Record<string, string> = {
      homework: 'Tareas y Trabajos',
      exams: 'Exámenes y Pruebas',
      attendance: 'Asistencia',
      participation: 'Participación',
      projects: 'Proyectos y Modulares',
      selfEval: 'Autoevaluación',
    };

    if (setScores) {
      setScores((prev) => {
        const studentMap = { ...(prev[studentId] || {}) };
        studentMap[periodKey] = cleanScore;
        studentMap[asgKey] = cleanScore;
        studentMap[directKey] = cleanScore;
        return {
          ...prev,
          [studentId]: studentMap,
        };
      });
    }

    setToastFeedback(`Calificación de ${categoryNames[category]} guardada: ${cleanScore.toFixed(1)}`);
    setTimeout(() => setToastFeedback(null), 3000);
    setEditingCell(null);
  };

  // Calculate weighted average for a specific period
  const calculatePeriodAverage = (studentId: string, periodIdx: number) => {
    const hw = calculatePeriodCriterionAvg(studentId, periodIdx, 'homework');
    const exam = calculatePeriodCriterionAvg(studentId, periodIdx, 'exams');
    const att = calculatePeriodCriterionAvg(studentId, periodIdx, 'attendance');
    const part = calculatePeriodCriterionAvg(studentId, periodIdx, 'participation');
    const proj = calculatePeriodCriterionAvg(studentId, periodIdx, 'projects');
    const self = calculatePeriodCriterionAvg(studentId, periodIdx, 'selfEval');

    const weighted = (
      (hw * weights.homework) +
      (exam * weights.exams) +
      (att * weights.attendance) +
      (part * weights.participation) +
      (proj * (weights.projects || 0)) +
      (self * weights.selfEval)
    ) / 100;

    return Math.round(weighted * 10) / 10;
  };

  // Calculate final cumulative grade
  const calculateStudentFinalGrade = (studentId: string) => {
    if (structure === 'ciclo_unico') {
      return calculatePeriodAverage(studentId, 1);
    }
    let sum = 0;
    for (let p = 1; p <= numPeriods; p++) {
      sum += calculatePeriodAverage(studentId, p);
    }
    return Math.round((sum / numPeriods) * 10) / 10;
  };

  // Handle cell edit save for individual assignment
  const handleCellBlurOrEnter = (studentId: string, assignmentId: string) => {
    const num = parseFloat(editValue);
    if (!isNaN(num)) {
      const clamped = Math.min(10, Math.max(0, Math.round(num * 10) / 10));
      setScores((prev) => ({
        ...prev,
        [studentId]: {
          ...(prev[studentId] || {}),
          [assignmentId]: clamped,
        },
      }));
    }
    setEditingCell(null);
  };

  // Add assignment scoped to currentGroup and active period
  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsgName.trim()) return;
    const newAsg: AssignmentGrade = {
      id: `asg-${currentGroup.id}-${Date.now()}`,
      groupId: currentGroup.id,
      name: newAsgName.trim(),
      category: newAsgCategory,
      periodIndex: newAsgPeriod,
      maxScore: 10,
    };
    setAssignments((prev) => [...prev, newAsg]);
    // Pre-populate with reasonable default for students
    setScores((prev) => {
      const next = { ...prev };
      students.forEach((s) => {
        if (!next[s.id]) next[s.id] = {};
        next[s.id][newAsg.id] = 8.5;
      });
      return next;
    });
    setNewAsgName('');
    setShowAddAssignmentModal(false);
    setToastFeedback(`Actividad "${newAsg.name}" agregada con éxito al ${getPeriodName(newAsgPeriod)}.`);
    setTimeout(() => setToastFeedback(null), 3000);
  };

  // Confirm delete assignment
  const handleConfirmDelete = () => {
    if (!assignmentToDelete) return;
    const asgId = assignmentToDelete.id;
    deleteAssignmentFromCloud(asgId);
    setAssignments((prev) => prev.filter((a) => a.id !== asgId));
    setScores((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((studentId) => {
        if (next[studentId] && next[studentId][asgId] !== undefined) {
          const copy = { ...next[studentId] };
          delete copy[asgId];
          next[studentId] = copy;
        }
      });
      return next;
    });
    setAssignmentToDelete(null);
    setToastFeedback('Actividad eliminada.');
    setTimeout(() => setToastFeedback(null), 3000);
  };

  // Save edit assignment
  const handleSaveEditAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentToEdit || !assignmentToEdit.name.trim()) return;
    setAssignments((prev) => prev.map((a) => (a.id === assignmentToEdit.id ? assignmentToEdit : a)));
    setAssignmentToEdit(null);
  };

  // Clear activities for the active period or whole group
  const handleClearPeriodAssignments = () => {
    setShowClearPeriodModal(true);
  };

  const handleExecuteClearPeriod = () => {
    const toRemove = typeof selectedPeriodFilter === 'number'
      ? groupAssignments.filter((a) => a.periodIndex === selectedPeriodFilter)
      : groupAssignments;

    const label = typeof selectedPeriodFilter === 'number'
      ? `del ${getPeriodName(selectedPeriodFilter)}`
      : `de ${currentGroup.name}`;

    const asgIdsToRemove = toRemove.map((a) => a.id);
    deleteAssignmentsFromCloud(asgIdsToRemove);
    const asgIdsSet = new Set(asgIdsToRemove);
    setAssignments((prev) => prev.filter((a) => !asgIdsSet.has(a.id)));
    setScores((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((studentId) => {
        if (next[studentId]) {
          const copy = { ...next[studentId] };
          asgIdsSet.forEach((id) => delete copy[id]);
          next[studentId] = copy;
        }
      });
      return next;
    });
    setShowClearPeriodModal(false);
    setToastFeedback(`Actividades ${label} eliminadas.`);
    setTimeout(() => setToastFeedback(null), 3000);
  };

  // Generate suggested clean assignments covering all 6 evaluation criteria
  const handleGenerateStarterTemplate = () => {
    const newAsgs: AssignmentGrade[] = [];
    const newScoresPatch: Record<string, Record<string, number>> = {};
    const timestamp = Date.now();
    const targetPeriod = typeof selectedPeriodFilter === 'number' ? selectedPeriodFilter : 1;
    
    const hwId = `asg-${currentGroup.id}-p${targetPeriod}-hw-${timestamp}`;
    const exId = `asg-${currentGroup.id}-p${targetPeriod}-ex-${timestamp}`;
    const attId = `asg-${currentGroup.id}-p${targetPeriod}-att-${timestamp}`;
    const partId = `asg-${currentGroup.id}-p${targetPeriod}-part-${timestamp}`;
    const projId = `asg-${currentGroup.id}-p${targetPeriod}-proj-${timestamp}`;
    const selfId = `asg-${currentGroup.id}-p${targetPeriod}-self-${timestamp}`;
    
    newAsgs.push(
      { id: hwId, groupId: currentGroup.id, name: `Tareas y Trabajos (${getPeriodName(targetPeriod)})`, category: 'homework', periodIndex: targetPeriod, maxScore: 10 },
      { id: exId, groupId: currentGroup.id, name: `Examen Parcial (${getPeriodName(targetPeriod)})`, category: 'exams', periodIndex: targetPeriod, maxScore: 10 },
      { id: attId, groupId: currentGroup.id, name: `Asistencia (${getPeriodName(targetPeriod)})`, category: 'attendance', periodIndex: targetPeriod, maxScore: 10 },
      { id: partId, groupId: currentGroup.id, name: `Participación (${getPeriodName(targetPeriod)})`, category: 'participation', periodIndex: targetPeriod, maxScore: 10 },
      { id: projId, groupId: currentGroup.id, name: `Proyecto Modular (${getPeriodName(targetPeriod)})`, category: 'projects', periodIndex: targetPeriod, maxScore: 10 },
      { id: selfId, groupId: currentGroup.id, name: `Autoevaluación (${getPeriodName(targetPeriod)})`, category: 'selfEval', periodIndex: targetPeriod, maxScore: 10 },
    );

    students.forEach((s) => {
      if (!newScoresPatch[s.id]) newScoresPatch[s.id] = {};
      newScoresPatch[s.id][hwId] = 9.0;
      newScoresPatch[s.id][exId] = 8.5;
      newScoresPatch[s.id][attId] = 10.0;
      newScoresPatch[s.id][partId] = 9.5;
      newScoresPatch[s.id][projId] = 9.0;
      newScoresPatch[s.id][selfId] = 10.0;
    });

    setAssignments((prev) => [...prev, ...newAsgs]);
    setScores((prev) => {
      const next = { ...prev };
      students.forEach((s) => {
        next[s.id] = { ...(next[s.id] || {}), ...(newScoresPatch[s.id] || {}) };
      });
      return next;
    });
    setToastFeedback(`6 Criterios base agregados al ${getPeriodName(targetPeriod)}.`);
    setTimeout(() => setToastFeedback(null), 3000);
  };

  // Export to CSV
  const exportGradebookCsv = () => {
    let csv = `Matrícula,Estudiante,` + groupAssignments.map((a) => `"${a.name}"`).join(',') + `,Promedio Final,Estado\n`;
    students.forEach((s) => {
      const avg = calculateStudentFinalGrade(s.id);
      const status = avg >= criteria.minPassingGrade ? 'Aprobado' : (avg >= 6.0 ? 'En Riesgo' : 'Reprobado');
      const studentScores = scores[s.id] || {};
      const scoreCols = groupAssignments.map((a) => studentScores[a.id] ?? '-').join(',');
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

  // Counts for the active period
  const homeworksInActivePeriod = groupAssignments.filter((a) => a.category === 'homework' && a.periodIndex === activePeriodIdx);
  const projectsInActivePeriod = groupAssignments.filter((a) => a.category === 'projects' && a.periodIndex === activePeriodIdx);

  // Class stats
  const classAverages = students.map((s) => calculateStudentFinalGrade(s.id));
  const overallAvg = classAverages.length > 0 
    ? (classAverages.reduce((a, b) => a + b, 0) / classAverages.length).toFixed(1) 
    : '0.0';
  const passingCount = classAverages.filter((a) => a >= criteria.minPassingGrade).length;
  const passingRate = students.length > 0 
    ? Math.round((passingCount / students.length) * 100) 
    : 0;

  return (
    <div className="flex flex-col w-full pb-16 px-space-lg pt-space-lg">
      {/* Toast Feedback */}
      {toastFeedback && (
        <div className="fixed top-20 right-8 z-50 bg-[#1E3A8A] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-fade-in border border-blue-400">
          <span className="material-symbols-outlined text-base text-emerald-400">check_circle</span>
          <span>{toastFeedback}</span>
        </div>
      )}

      {/* Top Header & Group Selector */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-md border-b border-[#E2E8F0]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
            <span className="material-symbols-outlined text-sm text-secondary">view_agenda</span>
            <span>Evaluación Continua por Corte Evaluativo</span>
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

        {/* Global Action Controls */}
        <div className="flex items-center gap-space-sm self-start md:self-auto shrink-0 flex-wrap">
          {onNavigateToAttendance && (
            <button
              onClick={onNavigateToAttendance}
              className="px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary text-xs font-bold transition-colors flex items-center gap-1.5 border border-primary/20 shadow-2xs cursor-pointer"
              title="Ir al pase de lista y acumulado de asistencias"
            >
              <span className="material-symbols-outlined text-base text-primary">co_present</span>
              <span>Pase de Lista</span>
            </button>
          )}

          {onNavigateToFinalGrades && (
            <button
              onClick={onNavigateToFinalGrades}
              className="px-3 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">workspace_premium</span>
              <span>Sábana Final y Boletas</span>
            </button>
          )}

          <button
            onClick={exportGradebookCsv}
            className="px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface text-xs font-semibold hover:bg-surface-container-low transition-colors flex items-center gap-1.5 shadow-sm border border-[#E2E8F0] cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Exportar CSV</span>
          </button>
        </div>
      </header>

      {/* Primary Period Tabs Selector (The Teacher's Core Navigation) */}
      <div className="my-space-md flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-container-low p-2 rounded-2xl border border-[#CBD5E1]">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider pl-2 pr-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-secondary">view_timeline</span>
            <span>Corte:</span>
          </span>
          {Array.from({ length: numPeriods }, (_, i) => i + 1).map((idx) => {
            const isSelected = selectedPeriodFilter === idx;
            const tasksCount = groupAssignments.filter((a) => a.periodIndex === idx).length;
            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedPeriodFilter(idx);
                  setNewAsgPeriod(idx);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{getPeriodName(idx)}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono-numeric ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tasksCount} act.
                </span>
              </button>
            );
          })}
          <button
            onClick={() => setSelectedPeriodFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedPeriodFilter === 'all'
                ? 'bg-secondary text-white shadow-md shadow-secondary/20 scale-[1.02]'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-sm">table_chart</span>
            <span>Sábana Concentrada (Todos)</span>
          </button>
        </div>

        {/* View Mode Toggle when viewing a specific period */}
        {typeof selectedPeriodFilter === 'number' && (
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 self-start md:self-auto shrink-0">
            <button
              onClick={() => setViewSubMode('criteria_summary')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewSubMode === 'criteria_summary'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-sm">equalizer</span>
              <span>Resumen 6 Criterios</span>
            </button>
            <button
              onClick={() => setViewSubMode('tasks_detail')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewSubMode === 'tasks_detail'
                  ? 'bg-secondary text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-sm">format_list_bulleted</span>
              <span>Detalle de Tareas ({visibleAssignments.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* Period Information & Quick Action Banner */}
      {typeof selectedPeriodFilter === 'number' && (
        <div className="p-3.5 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 rounded-2xl border border-blue-200/80 mb-space-md flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              P{selectedPeriodFilter}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-slate-900 text-sm">
                  Evaluación del {getPeriodName(selectedPeriodFilter)}
                </span>
                <span className="text-[11px] text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full font-semibold border border-blue-200">
                  {currentGroup.name} ({currentGroup.section})
                </span>
              </div>
              <p className="text-slate-600 text-[11px] mt-0.5">
                {viewSubMode === 'criteria_summary'
                  ? 'Uniendo automáticamente: Tareas promediadas, Proyectos, Asistencia (3R=1F), Exámenes y Autoevaluación. Haz clic en cualquier celda para editar.'
                  : `Viendo desglose de actividades individuales registradas en este corte. Puedes calificar tarea por tarea.`}
              </p>
            </div>
          </div>

          {/* Action buttons inside active period */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => {
                setNewAsgCategory('homework');
                setNewAsgPeriod(activePeriodIdx);
                setShowAddAssignmentModal(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/95 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>+ Tarea</span>
            </button>

            <button
              onClick={() => {
                setNewAsgCategory('projects');
                setNewAsgPeriod(activePeriodIdx);
                setShowAddAssignmentModal(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">assignment</span>
              <span>+ Proyecto</span>
            </button>

            {visibleAssignments.length === 0 ? (
              <button
                onClick={handleGenerateStarterTemplate}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                title="Generar tareas base sugeridas para este corte"
              >
                <span className="material-symbols-outlined text-sm text-emerald-600">playlist_add</span>
                <span>+ 6 Criterios Base</span>
              </button>
            ) : (
              <button
                onClick={handleClearPeriodAssignments}
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                title="Borrar todas las actividades de este corte"
              >
                <span className="material-symbols-outlined text-sm text-rose-600">delete_sweep</span>
                <span>Limpiar Corte</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Gradebook Matrix Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-[#E2E8F0] overflow-hidden flex flex-col">
        {/* Table Subtitle Banner */}
        <div className="p-space-sm bg-surface-container-low border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-base">
              {selectedPeriodFilter === 'all' ? 'table_chart' : viewSubMode === 'criteria_summary' ? 'equalizer' : 'format_list_bulleted'}
            </span>
            <span className="text-on-surface font-bold">
              {selectedPeriodFilter === 'all'
                ? 'Sábana Oficial de Evaluación Consolidada'
                : viewSubMode === 'criteria_summary'
                ? `Matriz de Criterios del ${getPeriodName(activePeriodIdx)} (6 Criterios Consolidados)`
                : `Desglose de Actividades Individuales del ${getPeriodName(activePeriodIdx)}`}
            </span>
            <span className="text-[11px] text-on-surface-variant font-mono-numeric">({students.length} estudiantes)</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-semibold text-on-surface-variant flex-wrap">
            <span>Ponderación oficial:</span>
            <span className="font-mono-numeric text-primary bg-primary/10 px-1.5 py-0.5 rounded">Tareas {weights.homework}%</span>
            <span className="font-mono-numeric text-primary bg-primary/10 px-1.5 py-0.5 rounded">Examen {weights.exams}%</span>
            <span className="font-mono-numeric text-primary bg-primary/10 px-1.5 py-0.5 rounded">Asistencia {weights.attendance}%</span>
            <span className="font-mono-numeric text-primary bg-primary/10 px-1.5 py-0.5 rounded">Part. {weights.participation}%</span>
            <span className="font-mono-numeric text-indigo-700 bg-indigo-100 font-bold px-1.5 py-0.5 rounded">Proyectos {weights.projects || 0}%</span>
            <span className="font-mono-numeric text-primary bg-primary/10 px-1.5 py-0.5 rounded">Auto. {weights.selfEval}%</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              {/* MODE 1: CRITERIA SUMMARY FOR SELECTED PERIOD */}
              {typeof selectedPeriodFilter === 'number' && viewSubMode === 'criteria_summary' && (
                <>
                  <tr className="bg-slate-200 border-b border-[#CBD5E1] text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                    <th className="py-2 px-3 sticky left-0 bg-slate-200 z-30 w-32 border-r border-[#CBD5E1] text-left">
                      Matrícula
                    </th>
                    <th className="py-2 px-3 sticky left-32 bg-slate-200 z-30 min-w-56 border-r-2 border-slate-300 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.1)] text-left">
                      Estudiante
                    </th>
                    <th colSpan={6} className="py-2 px-3 border-r border-[#CBD5E1] text-center bg-secondary/10 text-secondary">
                      Los 6 Criterios Oficiales del {getPeriodName(activePeriodIdx)}
                    </th>
                    <th colSpan={2} className="py-2 px-3 text-center bg-slate-100">
                      Resultado del Corte
                    </th>
                  </tr>

                  <tr className="bg-slate-100 border-b border-[#CBD5E1] text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-3 sticky left-0 bg-slate-100 z-20 w-32 border-r border-[#CBD5E1]">
                      Matrícula
                    </th>
                    <th className="py-2.5 px-3 sticky left-32 bg-slate-100 z-20 min-w-56 border-r-2 border-slate-300 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.1)]">
                      Estudiante
                    </th>

                    {/* Criteria Columns */}
                    <th className="py-2.5 px-3 text-center min-w-28 border-r border-[#CBD5E1] bg-primary/5">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-on-surface">Tareas</span>
                        <div className="text-[10px] text-primary font-mono-numeric">({weights.homework}%)</div>
                        <span className="text-[9px] text-slate-500 font-normal">
                          {homeworksInActivePeriod.length > 0 ? `${homeworksInActivePeriod.length} tareas prom.` : 'Directo'}
                        </span>
                      </div>
                    </th>

                    <th className="py-2.5 px-3 text-center min-w-28 border-r border-[#CBD5E1] bg-indigo-50/70">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-indigo-950">Proyectos</span>
                        <div className="text-[10px] text-indigo-700 font-mono-numeric">({weights.projects || 0}%)</div>
                        <span className="text-[9px] text-indigo-600 font-normal">
                          {projectsInActivePeriod.length > 0 ? `${projectsInActivePeriod.length} proy. prom.` : 'Directo'}
                        </span>
                      </div>
                    </th>

                    <th className="py-2.5 px-3 text-center min-w-28 border-r border-[#CBD5E1] bg-primary/5">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-on-surface">Asistencia</span>
                        <div className="text-[10px] text-primary font-mono-numeric">({weights.attendance}%)</div>
                        <span className="text-[9px] text-emerald-700 font-semibold">Regla 3R = 1F</span>
                      </div>
                    </th>

                    <th className="py-2.5 px-3 text-center min-w-24 border-r border-[#CBD5E1] bg-primary/5">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-on-surface">Part.</span>
                        <div className="text-[10px] text-primary font-mono-numeric">({weights.participation}%)</div>
                        <span className="text-[9px] text-slate-500 font-normal">Captura</span>
                      </div>
                    </th>

                    <th className="py-2.5 px-3 text-center min-w-28 border-r border-[#CBD5E1] bg-primary/5">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-on-surface">Examen</span>
                        <div className="text-[10px] text-primary font-mono-numeric">({weights.exams}%)</div>
                        <span className="text-[9px] text-slate-500 font-normal">P{activePeriodIdx}</span>
                      </div>
                    </th>

                    <th className="py-2.5 px-3 text-center min-w-24 border-r border-[#CBD5E1] bg-primary/5">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-on-surface">Auto.</span>
                        <div className="text-[10px] text-primary font-mono-numeric">({weights.selfEval}%)</div>
                        <span className="text-[9px] text-slate-500 font-normal">P{activePeriodIdx}</span>
                      </div>
                    </th>

                    <th className="py-2.5 px-3 text-center font-bold text-secondary min-w-28 border-r border-[#CBD5E1] bg-secondary/10">
                      Promedio P{activePeriodIdx}
                    </th>
                    <th className="py-2.5 px-3 text-center font-bold text-on-surface min-w-28">
                      Estatus
                    </th>
                  </tr>
                </>
              )}

              {/* MODE 2: TASKS DETAIL FOR SELECTED PERIOD */}
              {typeof selectedPeriodFilter === 'number' && viewSubMode === 'tasks_detail' && (
                <tr className="bg-slate-100 border-b border-[#CBD5E1] text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3 sticky left-0 bg-slate-100 z-20 w-32 border-r border-[#CBD5E1]">
                    Matrícula
                  </th>
                  <th className="py-2.5 px-3 sticky left-32 bg-slate-100 z-20 min-w-56 border-r-2 border-slate-300 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.1)]">
                    Estudiante
                  </th>

                  {visibleAssignments.length > 0 ? (
                    visibleAssignments.map((asg) => (
                      <th key={asg.id} className="py-2.5 px-3 text-center min-w-44 max-w-60 border-r border-[#CBD5E1] bg-slate-50 hover:bg-slate-100 transition-colors group/th">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="flex items-center justify-between w-full gap-1">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 shrink-0">
                              {getPeriodName(asg.periodIndex || activePeriodIdx)}
                            </span>
                            <div className="flex items-center gap-0.5 opacity-60 group-hover/th:opacity-100 transition-opacity shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAssignmentToEdit({ ...asg });
                                }}
                                className="p-1 rounded hover:bg-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer"
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
                          <span className="font-bold text-slate-900 truncate text-xs w-full text-center px-1" title={asg.name}>
                            {asg.name}
                          </span>
                          <span className="text-[10px] text-secondary font-mono-numeric font-semibold bg-white/90 px-2 py-0.5 rounded border border-slate-200">
                            {asg.category === 'homework' ? `Trabajos (${weights.homework}%)` :
                             asg.category === 'exams' ? `Examen (${weights.exams}%)` :
                             asg.category === 'attendance' ? `Asistencia (${weights.attendance}%)` :
                             asg.category === 'participation' ? `Part. (${weights.participation}%)` :
                             asg.category === 'projects' ? `Proyectos (${weights.projects || 0}%)` : `Auto. (${weights.selfEval}%)`}
                          </span>
                        </div>
                      </th>
                    ))
                  ) : (
                    <th className="py-2.5 px-4 text-center min-w-44 border-r border-[#CBD5E1] bg-amber-50/40 text-amber-800 text-xs font-medium italic">
                      Sin actividades individuales registradas en este corte
                    </th>
                  )}

                  <th className="py-2.5 px-3 text-center font-bold text-secondary min-w-28 border-r border-[#CBD5E1] bg-secondary/10">
                    Promedio P{activePeriodIdx}
                  </th>
                  <th className="py-2.5 px-3 text-center font-bold text-on-surface min-w-28">
                    Estatus
                  </th>
                </tr>
              )}

              {/* MODE 3: ALL PERIODS CONSOLIDATED SÁBANA */}
              {selectedPeriodFilter === 'all' && (
                <>
                  <tr className="bg-slate-200 border-b border-[#CBD5E1] text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                    <th className="py-2 px-3 sticky left-0 bg-slate-200 z-30 w-32 border-r border-[#CBD5E1] text-left">
                      Matrícula
                    </th>
                    <th className="py-2 px-3 sticky left-32 bg-slate-200 z-30 min-w-56 border-r-2 border-slate-300 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.1)] text-left">
                      Estudiante
                    </th>
                    <th colSpan={numPeriods} className="py-2 px-3 border-r border-[#CBD5E1] text-center bg-secondary/10 text-secondary">
                      Cortes Evaluativos ({structure.toUpperCase()})
                    </th>
                    <th colSpan={3} className="py-2 px-3 text-center bg-slate-100">
                      Dictamen Final Oficial
                    </th>
                  </tr>

                  <tr className="bg-slate-100 border-b border-[#CBD5E1] text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-3 sticky left-0 bg-slate-100 z-20 w-32 border-r border-[#CBD5E1]">
                      Matrícula
                    </th>
                    <th className="py-2.5 px-3 sticky left-32 bg-slate-100 z-20 min-w-56 border-r-2 border-slate-300 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.1)]">
                      Estudiante
                    </th>

                    {Array.from({ length: numPeriods }, (_, i) => i + 1).map((idx) => (
                      <th key={idx} className="py-2 px-3 text-center min-w-28 border-r border-[#CBD5E1] bg-secondary/5">
                        <div className="flex flex-col items-center">
                          <span className="font-bold text-on-surface">{getPeriodName(idx)}</span>
                          <span className="text-[10px] text-secondary font-mono-numeric">Promedio Corte</span>
                        </div>
                      </th>
                    ))}

                    <th className="py-2.5 px-3 text-center font-bold text-primary min-w-28 border-r border-[#CBD5E1] bg-surface-container-low">
                      Promedio Final
                    </th>
                    <th className="py-2.5 px-3 text-center font-bold text-on-surface min-w-28 border-r border-[#CBD5E1]">
                      Estatus
                    </th>
                    <th className="py-2.5 px-3 text-center font-bold text-on-surface min-w-28">
                      Boleta
                    </th>
                  </tr>
                </>
              )}
            </thead>

            <tbody className="divide-y divide-[#F1F5F9]">
              {students.map((student, idx) => {
                const studentScores = scores[student.id] || {};
                const finalAvg = calculateStudentFinalGrade(student.id);
                const isPassing = finalAvg >= criteria.minPassingGrade;
                const isAtRisk = !isPassing && finalAvg >= 6.0;

                // 1. RENDER CRITERIA SUMMARY FOR ACTIVE PERIOD
                if (typeof selectedPeriodFilter === 'number' && viewSubMode === 'criteria_summary') {
                  const pScore = calculatePeriodAverage(student.id, activePeriodIdx);
                  const isPeriodPassing = pScore >= criteria.minPassingGrade;
                  const isPeriodRisk = !isPeriodPassing && pScore >= 6.0;

                  return (
                    <tr key={student.id} className={`hover:bg-blue-50/40 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}`}>
                      {/* Matrícula */}
                      <td className={`py-2 px-3 sticky left-0 z-10 font-mono-numeric font-semibold text-xs text-on-surface border-r border-[#E2E8F0] ${idx % 2 === 1 ? 'bg-[#F8FAFC]' : 'bg-white'}`}>
                        {student.matricula}
                      </td>

                      {/* Estudiante */}
                      <td className={`py-2 px-3 sticky left-32 z-10 border-r-2 border-slate-300 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.08)] ${idx % 2 === 1 ? 'bg-[#F8FAFC]' : 'bg-white'}`}>
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

                      {/* The 6 Criteria Cells (Click to edit directly) */}
                      {(
                        [
                          { key: 'homework', label: 'Tareas', isProj: false },
                          { key: 'projects', label: 'Proyectos', isProj: true },
                          { key: 'attendance', label: 'Asistencia', isProj: false },
                          { key: 'participation', label: 'Participación', isProj: false },
                          { key: 'exams', label: 'Exámenes', isProj: false },
                          { key: 'selfEval', label: 'Autoevaluación', isProj: false },
                        ] as const
                      ).map(({ key: cat, label, isProj }) => {
                        const isEditing = editingCell?.studentId === student.id && editingCell?.category === cat && editingCell?.periodIdx === activePeriodIdx;
                        const scoreVal = calculatePeriodCriterionAvg(student.id, activePeriodIdx, cat);

                        return (
                          <td
                            key={cat}
                            onClick={() => {
                              if (!isEditing) {
                                setEditingCell({ studentId: student.id, category: cat, periodIdx: activePeriodIdx });
                                setEditValue(String(scoreVal));
                              }
                            }}
                            className={`py-2 px-2 text-center border-r border-[#E2E8F0] font-mono-numeric text-xs transition-colors cursor-pointer group hover:bg-secondary/15 relative ${
                              isProj ? 'bg-indigo-50/40 font-bold text-indigo-950' : 'text-on-surface'
                            }`}
                            title={`Clic para capturar o editar ${label} del ${getPeriodName(activePeriodIdx)}`}
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
                                onBlur={() => handleSavePeriodCriterionScore(student.id, cat, editValue, activePeriodIdx)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSavePeriodCriterionScore(student.id, cat, editValue, activePeriodIdx);
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                                className="w-16 h-7 text-center font-mono-numeric text-xs font-bold text-secondary bg-white border-2 border-secondary rounded shadow-sm focus:outline-none"
                              />
                            ) : (
                              <div className="flex items-center justify-center gap-1">
                                <span className={scoreVal < 6.0 ? 'text-[#991B1B] font-bold' : ''}>
                                  {scoreVal.toFixed(1)}
                                </span>
                                <span className="material-symbols-outlined text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                  edit
                                </span>
                              </div>
                            )}
                          </td>
                        );
                      })}

                      {/* Period Average */}
                      <td className="py-2 px-3 text-center font-mono-numeric text-xs font-bold border-r border-[#E2E8F0] bg-secondary/10 text-secondary">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-extrabold ${
                          isPeriodPassing ? 'text-primary bg-primary/10' : isPeriodRisk ? 'text-[#92400E] bg-[#FFFBEB]' : 'text-[#991B1B] bg-[#FEF2F2]'
                        }`}>
                          {pScore.toFixed(1)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-2 px-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isPeriodPassing ? 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]' : isPeriodRisk ? 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]' : 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]'
                        }`}>
                          {isPeriodPassing ? 'Aprobado' : isPeriodRisk ? 'En Riesgo' : 'Reprobado'}
                        </span>
                      </td>
                    </tr>
                  );
                }

                // 2. RENDER TASKS DETAIL FOR ACTIVE PERIOD
                if (typeof selectedPeriodFilter === 'number' && viewSubMode === 'tasks_detail') {
                  const pSubtotal = calculatePeriodAverage(student.id, activePeriodIdx);
                  const isSubPassing = pSubtotal >= criteria.minPassingGrade;
                  const isSubRisk = !isSubPassing && pSubtotal >= 6.0;

                  return (
                    <tr key={student.id} className={`hover:bg-blue-50/40 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}`}>
                      {/* Matrícula */}
                      <td className={`py-2 px-3 sticky left-0 z-10 font-mono-numeric font-semibold text-xs text-on-surface border-r border-[#E2E8F0] ${idx % 2 === 1 ? 'bg-[#F8FAFC]' : 'bg-white'}`}>
                        {student.matricula}
                      </td>

                      {/* Estudiante */}
                      <td className={`py-2 px-3 sticky left-32 z-10 border-r-2 border-slate-300 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.08)] ${idx % 2 === 1 ? 'bg-[#F8FAFC]' : 'bg-white'}`}>
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

                      <td className="py-2 px-3 text-center font-mono-numeric text-xs font-bold border-r border-[#E2E8F0] bg-secondary/10 text-secondary">
                        {pSubtotal.toFixed(1)}
                      </td>

                      <td className="py-2 px-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isSubPassing ? 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]' : isSubRisk ? 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]' : 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]'
                        }`}>
                          {isSubPassing ? 'Aprobado' : isSubRisk ? 'En Riesgo' : 'Reprobado'}
                        </span>
                      </td>
                    </tr>
                  );
                }

                // 3. RENDER ALL PERIODS CONSOLIDATED
                return (
                  <tr key={student.id} className={`hover:bg-blue-50/40 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}`}>
                    {/* Matrícula */}
                    <td className={`py-2 px-3 sticky left-0 z-10 font-mono-numeric font-semibold text-xs text-on-surface border-r border-[#E2E8F0] ${idx % 2 === 1 ? 'bg-[#F8FAFC]' : 'bg-white'}`}>
                      {student.matricula}
                    </td>

                    {/* Estudiante */}
                    <td className={`py-2 px-3 sticky left-32 z-10 border-r-2 border-slate-300 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.08)] ${idx % 2 === 1 ? 'bg-[#F8FAFC]' : 'bg-white'}`}>
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

                    {/* Period Scores */}
                    {Array.from({ length: numPeriods }, (_, i) => i + 1).map((pIdx) => {
                      const pSubtotal = calculatePeriodAverage(student.id, pIdx);
                      const isPPassing = pSubtotal >= criteria.minPassingGrade;
                      return (
                        <td key={pIdx} className="py-2.5 px-3 text-center border-r border-[#E2E8F0] font-mono-numeric text-xs font-semibold">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                            isPPassing ? 'text-primary bg-primary/5' : pSubtotal >= 6.0 ? 'text-[#92400E] bg-[#FFFBEB]' : 'text-[#991B1B] bg-[#FEF2F2]'
                          }`}>
                            {pSubtotal.toFixed(1)}
                          </span>
                        </td>
                      );
                    })}

                    {/* Final Average */}
                    <td className="py-2.5 px-3 text-center font-mono-numeric text-sm font-bold border-r border-[#E2E8F0] bg-surface-container-low/40">
                      <span className={isPassing ? 'text-primary' : isAtRisk ? 'text-[#92400E]' : 'text-error'}>
                        {finalAvg.toFixed(1)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 text-center border-r border-[#E2E8F0]">
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

                    {/* Boleta Link */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={onNavigateToFinalGrades}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-container-low hover:bg-primary hover:text-white text-primary border border-primary/20 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                        title="Ver boleta oficial consolidada"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        <span>Boleta</span>
                      </button>
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
                <span>Crear Nueva Actividad / Tarea</span>
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
                  autoFocus
                  value={newAsgName}
                  onChange={(e) => setNewAsgName(e.target.value)}
                  placeholder="Ej. Tarea 1: Ejercicios de Vectores"
                  className="w-full h-9 px-3 text-xs bg-surface-container-low rounded border border-[#CBD5E1] mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface">Criterio Institucional</label>
                <select
                  value={newAsgCategory}
                  onChange={(e) => setNewAsgCategory(e.target.value as any)}
                  className="w-full h-9 px-3 text-xs bg-surface-container-low rounded border border-[#CBD5E1] mt-1 cursor-pointer font-medium"
                >
                  <option value="homework">Tareas y Trabajos ({weights.homework}%)</option>
                  <option value="projects">Proyectos y Modulares ({weights.projects || 0}%)</option>
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
                  className="px-3 py-1.5 text-xs font-semibold bg-surface-container-high rounded text-on-surface cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-primary text-on-primary rounded hover:bg-primary-container cursor-pointer"
                >
                  Guardar Actividad
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
                  <option value="projects">Proyectos y Modulares ({weights.projects || 0}%)</option>
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
              <span>Esta acción borrará la columna y todas las calificaciones capturadas para esta actividad de forma permanente en la nube.</span>
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

      {/* Modal: Confirmación para Limpiar Actividades del Corte */}
      {showClearPeriodModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 p-6 w-full max-w-sm animate-fadeIn">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">cleaning_services</span>
            </div>
            <h3 className="font-bold text-base text-slate-900">¿Limpiar actividades registradas?</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              ¿Deseas eliminar permanentemente todas las actividades registradas {typeof selectedPeriodFilter === 'number' ? `del ${getPeriodName(selectedPeriodFilter)}` : `de ${currentGroup.name}`}?
            </p>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-[11px] text-rose-800 mt-3 flex items-start gap-2">
              <span className="material-symbols-outlined text-sm text-rose-600 shrink-0 mt-0.5">delete_forever</span>
              <span>Esta acción borrará las tareas y sus notas asociadas de forma permanente en la nube y no volverán a aparecer.</span>
            </div>

            <div className="flex justify-end gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setShowClearPeriodModal(false)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteClearPeriod}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                <span>Sí, Limpiar Corte</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
