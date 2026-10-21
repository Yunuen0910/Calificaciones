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
}

export const GradebookView: React.FC<GradebookViewProps> = ({
  groups,
  selectedGroupId,
  onSelectGroup,
  onOpenCreateGroup,
}) => {
  const currentGroup = groups.find((g) => g.id === selectedGroupId) || groups[0];

  const [assignments, setAssignments] = useState<AssignmentGrade[]>(INITIAL_ASSIGNMENTS);
  const [scores, setScores] = useState<Record<string, Record<string, number>>>(INITIAL_STUDENT_SCORES);
  const [editingCell, setEditingCell] = useState<{ studentId: string; assignmentId: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(false);
  const [newAsgName, setNewAsgName] = useState('');
  const [newAsgCategory, setNewAsgCategory] = useState<'homework' | 'exams' | 'attendance' | 'participation' | 'selfEval'>('homework');

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

  const { criteria, students } = currentGroup;
  const weights = criteria.weights;

  // Calculate weighted average for a student
  const calculateStudentAverage = (studentId: string) => {
    const studentScores = scores[studentId] || {};

    const getCategoryAvg = (category: 'homework' | 'exams' | 'attendance' | 'participation' | 'selfEval') => {
      const catAssignments = assignments.filter((a) => a.category === category);
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

  // Add assignment
  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsgName.trim()) return;
    const newAsg: AssignmentGrade = {
      id: `asg-${Date.now()}`,
      name: newAsgName.trim(),
      category: newAsgCategory,
      maxScore: 10
    };
    setAssignments(prev => [...prev, newAsg]);
    // Pre-populate with default 8.5
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
        <div className="flex items-center gap-space-sm self-start md:self-auto shrink-0">
          <button
            onClick={() => setShowAddAssignmentModal(true)}
            className="px-3 py-2 rounded-lg bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-variant transition-colors flex items-center gap-1.5 shadow-sm border border-[#E2E8F0] cursor-pointer"
          >
            <span className="material-symbols-outlined text-base text-secondary">add_task</span>
            <span>Nueva Actividad</span>
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
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Esquema Activo</span>
            <p className="text-xs font-bold text-secondary mt-1">Trabajos {weights.homework}% • Exámenes {weights.exams}%</p>
          </div>
          <span className="material-symbols-outlined text-secondary text-2xl">tune</span>
        </div>
      </div>

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
              <tr className="bg-surface-container-high/60 border-b border-[#CBD5E1] text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3 sticky left-0 bg-surface-container-high/95 z-20 w-32 border-r border-[#CBD5E1]">
                  Matrícula
                </th>
                <th className="py-2.5 px-3 sticky left-32 bg-surface-container-high/95 z-20 min-w-56 border-r border-[#CBD5E1]">
                  Estudiante
                </th>
                {assignments.map((asg) => (
                  <th key={asg.id} className="py-2.5 px-3 text-center min-w-32 border-r border-[#CBD5E1]">
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-on-surface truncate max-w-28" title={asg.name}>
                        {asg.name}
                      </span>
                      <span className="text-[10px] text-secondary font-mono-numeric">
                        {asg.category === 'homework' ? `Trabajos (${weights.homework}%)` :
                         asg.category === 'exams' ? `Examen (${weights.exams}%)` :
                         asg.category === 'attendance' ? `Asistencia (${weights.attendance}%)` :
                         asg.category === 'participation' ? `Part. (${weights.participation}%)` : `Auto. (${weights.selfEval}%)`}
                      </span>
                    </div>
                  </th>
                ))}
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
                const finalAvg = calculateStudentAverage(student.id);
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

                    {/* Assignments inline editing */}
                    {assignments.map((asg) => {
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
                    })}

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
    </div>
  );
};
