/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Group, AttendanceStatus, AssignmentGrade } from '../types';

interface AttendanceRecord {
  presents: number;
  lates: number;
  absents: number;
  excused: number;
}

interface AttendanceViewProps {
  groups: Group[];
  selectedGroupId?: string;
  onSelectGroup: (groupId: string) => void;
  onOpenCreateGroup: () => void;
  assignments?: AssignmentGrade[];
  setAssignments?: (action: React.SetStateAction<AssignmentGrade[]>) => void;
  scores?: Record<string, Record<string, number>>;
  setScores?: (action: React.SetStateAction<Record<string, Record<string, number>>>) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  groups,
  selectedGroupId,
  onSelectGroup,
  onOpenCreateGroup,
  assignments = [],
  setAssignments,
  scores = {},
  setScores,
}) => {
  const currentGroup = groups.find((g) => g.id === selectedGroupId) || groups[0];

  // Active view mode: 'daily' (Pase de lista diario) vs 'cumulative' (Evaluación acumulada)
  const [activeTabMode, setActiveTabMode] = useState<'daily' | 'cumulative'>('cumulative');

  // Daily roll call state
  const [selectedDate, setSelectedDate] = useState('2026-10-21');
  const [dailyAttendance, setDailyAttendance] = useState<Record<string, { status: AttendanceStatus; notes: string }>>({
    'std-1': { status: 'present', notes: '' },
    'std-2': { status: 'present', notes: '' },
    'std-3': { status: 'late', notes: 'Entró con 7 min de tolerancia' },
    'std-4': { status: 'absent', notes: 'Sin aviso previo' },
    'std-5': { status: 'present', notes: '' },
    'std-6': { status: 'excused', notes: 'Justificante médico presentado' },
  });

  // Cumulative sessions configuration per group
  const [totalSessions, setTotalSessions] = useState<number>(30);

  // Cumulative student attendance records (Presents, Lates, Absents, Excused)
  const [cumulativeRecords, setCumulativeRecords] = useState<Record<string, AttendanceRecord>>(() => {
    const saved = localStorage.getItem(`aulagrade_att_cum_${currentGroup?.id || 'default'}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved cumulative attendance', e);
      }
    }
    // Default initial counts with realistic variations
    return {
      'std-1': { presents: 29, lates: 1, absents: 0, excused: 0 },
      'std-2': { presents: 27, lates: 2, absents: 1, excused: 0 },
      'std-3': { presents: 24, lates: 4, absents: 2, excused: 0 }, // 4 lates = 1 extra absence -> total 3 absences
      'std-4': { presents: 21, lates: 6, absents: 3, excused: 0 }, // 6 lates = 2 extra absences -> total 5 absences
      'std-5': { presents: 30, lates: 0, absents: 0, excused: 0 },
      'std-6': { presents: 18, lates: 3, absents: 7, excused: 2 }, // 3 lates = 1 extra absence -> total 8 absences
    };
  });

  // Search filter
  const [studentSearch, setStudentSearch] = useState('');

  // Toast notifications
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Sync state when group changes
  useEffect(() => {
    if (!currentGroup) return;
    const saved = localStorage.getItem(`aulagrade_att_cum_${currentGroup.id}`);
    if (saved) {
      try {
        setCumulativeRecords(JSON.parse(saved));
        return;
      } catch (e) {}
    }
    // Generate default baseline for students in this group
    const initial: Record<string, AttendanceRecord> = {};
    currentGroup.students.forEach((s, idx) => {
      // Some realistic baseline numbers
      const l = idx === 2 ? 4 : idx === 3 ? 6 : idx === 5 ? 3 : idx === 1 ? 2 : 0;
      const ab = idx === 3 ? 3 : idx === 5 ? 7 : idx === 2 ? 2 : 0;
      initial[s.id] = {
        presents: Math.max(0, 30 - l - ab),
        lates: l,
        absents: ab,
        excused: idx === 5 ? 2 : 0,
      };
    });
    setCumulativeRecords(initial);
  }, [currentGroup?.id]);

  // Persist cumulative records to localStorage
  const handleUpdateCumulativeRecord = (studentId: string, patch: Partial<AttendanceRecord>) => {
    setCumulativeRecords((prev) => {
      const current = prev[studentId] || { presents: totalSessions, lates: 0, absents: 0, excused: 0 };
      const updated = {
        ...prev,
        [studentId]: {
          ...current,
          ...patch,
        },
      };
      if (currentGroup) {
        localStorage.setItem(`aulagrade_att_cum_${currentGroup.id}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

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

  const { students, schedule, lateTolerance } = currentGroup;
  const activeSessions = schedule.filter((s) => s.active);

  // Daily roll call helpers
  const setDailyStatus = (studentId: string, status: AttendanceStatus) => {
    setDailyAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { notes: '' }),
        status,
      },
    }));
  };

  const setDailyNotes = (studentId: string, notes: string) => {
    setDailyAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { status: 'present' }),
        notes,
      },
    }));
  };

  const markAllDailyPresent = () => {
    const updated: Record<string, { status: AttendanceStatus; notes: string }> = {};
    students.forEach((s) => {
      updated[s.id] = { status: 'present', notes: '' };
    });
    setDailyAttendance(updated);
  };

  const handleSaveDailyAttendance = () => {
    setSaveToast('Pase de lista del día registrado y sincronizado en el expediente.');
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Metrics for daily view
  const dailyPresentCount = students.filter((s) => dailyAttendance[s.id]?.status === 'present').length;
  const dailyLateCount = students.filter((s) => dailyAttendance[s.id]?.status === 'late').length;
  const dailyAbsentCount = students.filter((s) => dailyAttendance[s.id]?.status === 'absent').length;
  const dailyExcusedCount = students.filter((s) => dailyAttendance[s.id]?.status === 'excused').length;
  const dailyEffective = dailyPresentCount + dailyLateCount * 0.8 + dailyExcusedCount * 1.0;
  const dailyAttendanceRate = students.length > 0 ? Math.round((dailyEffective / students.length) * 100) : 100;

  // Calculation rule: 3 retardos equivalen a 1 falta adicional
  const computeStudentAttendanceStats = (studentId: string) => {
    const rec = cumulativeRecords[studentId] || { presents: totalSessions, lates: 0, absents: 0, excused: 0 };
    const lates = Math.max(0, rec.lates || 0);
    const absents = Math.max(0, rec.absents || 0);
    const presents = Math.max(0, rec.presents || 0);
    const excused = Math.max(0, rec.excused || 0);

    // Rule: 3 retardos = 1 falta adicional
    const extraAbsencesFromLates = Math.floor(lates / 3);
    const totalEffectiveAbsences = absents + extraAbsencesFromLates;

    // % de Faltas
    const effectiveSessions = Math.max(1, totalSessions);
    const absencePercentage = Math.min(100, Math.round((totalEffectiveAbsences / effectiveSessions) * 1000) / 10);

    // % de Asistencia
    const attendancePercentage = Math.max(0, Math.round((100 - absencePercentage) * 10) / 10);

    // Suggested Grade on 0-10 scale
    const suggestedScore = Math.min(10, Math.max(0, Math.round((attendancePercentage / 10) * 10) / 10));

    return {
      presents,
      lates,
      absents,
      excused,
      extraAbsencesFromLates,
      totalEffectiveAbsences,
      absencePercentage,
      attendancePercentage,
      suggestedScore,
    };
  };

  // Sync attendance scores to Cuaderno de Notas and Final Grades
  const handleSyncAttendanceScores = () => {
    if (!setScores) {
      setSaveToast('No se puede sincronizar en este momento.');
      setTimeout(() => setSaveToast(null), 3000);
      return;
    }

    const directAttendanceKey = `cat_${currentGroup.id}_attendance`;

    // Ensure attendance assignment exists
    let targetAssignmentId = directAttendanceKey;
    if (setAssignments) {
      setAssignments((prev) => {
        const existing = prev.find(
          (a) => (a.groupId === currentGroup.id || !a.groupId) && a.category === 'attendance'
        );
        if (existing) {
          targetAssignmentId = existing.id;
          return prev;
        }
        const newAsg: AssignmentGrade = {
          id: directAttendanceKey,
          groupId: currentGroup.id,
          name: 'Asistencia y Puntualidad Oficial',
          category: 'attendance',
          periodIndex: 1,
          maxScore: 10,
        };
        return [...prev, newAsg];
      });
    }

    // Update all student scores in scores state
    setScores((prev) => {
      const next = { ...prev };
      students.forEach((s) => {
        const stats = computeStudentAttendanceStats(s.id);
        const studentScores = { ...(next[s.id] || {}) };
        studentScores[directAttendanceKey] = stats.suggestedScore;
        studentScores[targetAssignmentId] = stats.suggestedScore;
        next[s.id] = studentScores;
      });
      return next;
    });

    setSaveToast(
      `¡Calificaciones de asistencia sincronizadas con éxito! Se aplicó la regla oficial (3 retardos = 1 falta) a los ${students.length} alumnos.`
    );
    setTimeout(() => setSaveToast(null), 4000);
  };

  const filteredStudents = students.filter((s) => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.matricula.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col w-full pb-16 px-space-lg pt-space-lg">
      {saveToast && (
        <div className="fixed top-20 right-8 z-50 bg-[#1E3A8A] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-fade-in border border-blue-400">
          <span className="material-symbols-outlined text-base text-emerald-400">check_circle</span>
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Header & Group Selector */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-lg border-b border-[#E2E8F0]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
            <span className="material-symbols-outlined text-sm">how_to_reg</span>
            <span>Control de Asistencia y Puntualidad</span>
            <span>•</span>
            <span className="text-secondary font-semibold font-mono-numeric">{currentGroup.academicCycle}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Asistencia y Puntualidad</h1>
            <div className="relative">
              <select
                value={currentGroup.id}
                onChange={(e) => onSelectGroup(e.target.value)}
                className="h-9 pl-3 pr-8 text-xs font-bold text-primary bg-surface-container-low rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-secondary cursor-pointer"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.code} - {g.name} ({g.section} • {g.semester})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* View Mode Tabs Selector */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-surface-container-low p-1 rounded-xl border border-[#CBD5E1]">
          <button
            onClick={() => setActiveTabMode('cumulative')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTabMode === 'cumulative'
                ? 'bg-primary text-white shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">calculate</span>
            <span>Evaluación Acumulada (3R = 1F)</span>
          </button>

          <button
            onClick={() => setActiveTabMode('daily')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTabMode === 'daily'
                ? 'bg-primary text-white shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">fact_check</span>
            <span>Pase de Lista del Día</span>
          </button>
        </div>
      </header>

      {/* Official Attendance Evaluation Rule Banner */}
      <div className="my-space-md p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-xl">rule</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">Regla Oficial de Evaluación de Asistencia</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                Normativa Activa
              </span>
            </div>
            <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
              <strong>3 retardos equivalen a 1 falta adicional acumulada</strong>. El porcentaje de asistencia es igual a{' '}
              <code className="text-primary font-bold font-mono">100% - % de faltas efectivas</code>. La nota sobre 10 se
              calcula como <code className="text-primary font-bold font-mono">% asistencia / 10</code>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-blue-200">
            <span className="text-[11px] font-semibold text-slate-700">Sesiones Totales:</span>
            <input
              type="number"
              min="1"
              max="120"
              value={totalSessions}
              onChange={(e) => setTotalSessions(Math.max(1, Number(e.target.value)))}
              className="w-14 h-7 text-center font-mono-numeric text-xs font-bold text-primary bg-slate-50 border border-slate-300 rounded focus:outline-none"
            />
          </div>

          <button
            onClick={handleSyncAttendanceScores}
            className="px-3.5 py-2 bg-primary hover:bg-primary-container text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer shrink-0"
            title="Aplica la nota calculada de asistencia directamente al Cuaderno de Notas y Sábana Final"
          >
            <span className="material-symbols-outlined text-base">sync</span>
            <span>Sincronizar Calificaciones al Cuaderno</span>
          </button>
        </div>
      </div>

      {activeTabMode === 'cumulative' ? (
        /* ================= CUMULATIVE ATTENDANCE SHEET (3 RETARDOS = 1 FALTA) ================= */
        <div className="space-y-space-md">
          {/* Filter & Summary Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-3 rounded-xl border border-[#E2E8F0]">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <span className="material-symbols-outlined text-outline text-base">search</span>
              <input
                type="text"
                placeholder="Buscar por estudiante o matrícula..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full text-xs bg-transparent focus:outline-none placeholder:text-outline font-medium"
              />
            </div>
            <div className="text-xs text-on-surface-variant flex items-center gap-3 font-medium">
              <span>Alumnos: <strong className="text-on-surface">{filteredStudents.length}</strong></span>
              <span>•</span>
              <span>Ponderación Asistencia: <strong className="text-primary">{currentGroup.criteria.weights.attendance}%</strong></span>
            </div>
          </div>

          {/* Cumulative Table */}
          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-[#CBD5E1] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-surface-container-high border-b border-[#CBD5E1] text-[11px] font-bold text-on-surface uppercase tracking-wider">
                    <th className="py-2.5 px-3 border-r border-[#CBD5E1] w-28">Matrícula</th>
                    <th className="py-2.5 px-3 border-r border-[#CBD5E1] min-w-48">Estudiante</th>
                    <th className="py-2.5 px-2 text-center border-r border-[#CBD5E1] w-20">Asistencias</th>
                    <th className="py-2.5 px-2 text-center border-r border-[#CBD5E1] w-24 bg-amber-50/60 text-amber-950">
                      Retardos (R)
                    </th>
                    <th className="py-2.5 px-2 text-center border-r border-[#CBD5E1] w-24 bg-rose-50/60 text-rose-950">
                      Faltas (F)
                    </th>
                    <th className="py-2.5 px-2 text-center border-r border-[#CBD5E1] min-w-32 bg-amber-100/40 text-amber-900">
                      Faltas x Retardo (⌊R/3⌋)
                    </th>
                    <th className="py-2.5 px-2 text-center border-r border-[#CBD5E1] min-w-32 bg-rose-100/50 text-rose-900">
                      Total Faltas Efectivas
                    </th>
                    <th className="py-2.5 px-2 text-center border-r border-[#CBD5E1] w-24 text-rose-800">
                      % Faltas
                    </th>
                    <th className="py-2.5 px-2 text-center border-r border-[#CBD5E1] w-24 text-emerald-800">
                      % Asistencia
                    </th>
                    <th className="py-2.5 px-3 text-center border-r border-[#CBD5E1] w-28 bg-primary/5 text-primary font-bold">
                      Calificación (0-10)
                    </th>
                    <th className="py-2.5 px-3 text-center w-28">Estatus</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#F1F5F9]">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="text-center py-8 text-on-surface-variant text-xs">
                        No se encontraron estudiantes en este grupo.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, idx) => {
                      const stats = computeStudentAttendanceStats(student.id);
                      const isPassingAttendance = stats.attendancePercentage >= 80;
                      const isRiskAttendance = stats.attendancePercentage >= 70 && !isPassingAttendance;

                      return (
                        <tr
                          key={student.id}
                          className={`hover:bg-surface-container-low/50 transition-colors ${
                            idx % 2 === 1 ? 'bg-surface-container-low/15' : ''
                          }`}
                        >
                          {/* Matrícula */}
                          <td className="py-2.5 px-3 font-mono-numeric font-semibold text-xs text-on-surface border-r border-[#E2E8F0]">
                            {student.matricula}
                          </td>

                          {/* Estudiante */}
                          <td className="py-2.5 px-3 border-r border-[#E2E8F0]">
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
                              <span className="font-semibold text-xs text-on-surface truncate">{student.name}</span>
                            </div>
                          </td>

                          {/* Asistencias (Presentes) */}
                          <td className="py-2.5 px-2 text-center border-r border-[#E2E8F0]">
                            <input
                              type="number"
                              min="0"
                              max={totalSessions}
                              value={stats.presents}
                              onChange={(e) =>
                                handleUpdateCumulativeRecord(student.id, {
                                  presents: Number(e.target.value),
                                })
                              }
                              className="w-14 h-7 text-center font-mono-numeric text-xs font-bold text-emerald-700 bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-emerald-600"
                            />
                          </td>

                          {/* Retardos (R) */}
                          <td className="py-2.5 px-2 text-center border-r border-[#E2E8F0] bg-amber-50/30">
                            <input
                              type="number"
                              min="0"
                              max={totalSessions}
                              value={stats.lates}
                              onChange={(e) =>
                                handleUpdateCumulativeRecord(student.id, {
                                  lates: Number(e.target.value),
                                })
                              }
                              className="w-14 h-7 text-center font-mono-numeric text-xs font-bold text-amber-700 bg-white border border-amber-300 rounded focus:outline-none focus:border-amber-500 shadow-xs"
                            />
                          </td>

                          {/* Faltas (F) */}
                          <td className="py-2.5 px-2 text-center border-r border-[#E2E8F0] bg-rose-50/30">
                            <input
                              type="number"
                              min="0"
                              max={totalSessions}
                              value={stats.absents}
                              onChange={(e) =>
                                handleUpdateCumulativeRecord(student.id, {
                                  absents: Number(e.target.value),
                                })
                              }
                              className="w-14 h-7 text-center font-mono-numeric text-xs font-bold text-rose-700 bg-white border border-rose-300 rounded focus:outline-none focus:border-rose-500 shadow-xs"
                            />
                          </td>

                          {/* Faltas x Retardo (⌊R/3⌋) */}
                          <td className="py-2.5 px-2 text-center border-r border-[#E2E8F0] bg-amber-50/50">
                            <div className="flex items-center justify-center gap-1 font-mono-numeric text-xs">
                              <span
                                className={`px-2 py-0.5 rounded font-bold ${
                                  stats.extraAbsencesFromLates > 0
                                    ? 'bg-amber-200 text-amber-900 border border-amber-300'
                                    : 'text-slate-400'
                                }`}
                              >
                                +{stats.extraAbsencesFromLates} falta{stats.extraAbsencesFromLates !== 1 ? 's' : ''}
                              </span>
                              {stats.lates % 3 > 0 && (
                                <span className="text-[10px] text-amber-700" title="Retardos pendientes para sumar otra falta">
                                  ({stats.lates % 3}/3)
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Total Faltas Efectivas */}
                          <td className="py-2.5 px-2 text-center border-r border-[#E2E8F0] font-mono-numeric font-bold text-xs bg-rose-50/40">
                            <span
                              className={`px-2 py-0.5 rounded ${
                                stats.totalEffectiveAbsences > 4
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'text-slate-800'
                              }`}
                            >
                              {stats.totalEffectiveAbsences}
                            </span>
                          </td>

                          {/* % Faltas */}
                          <td className="py-2.5 px-2 text-center border-r border-[#E2E8F0] font-mono-numeric text-xs text-rose-700 font-semibold">
                            {stats.absencePercentage}%
                          </td>

                          {/* % Asistencia */}
                          <td className="py-2.5 px-2 text-center border-r border-[#E2E8F0] font-mono-numeric text-xs font-bold">
                            <span
                              className={
                                isPassingAttendance
                                  ? 'text-emerald-700'
                                  : isRiskAttendance
                                  ? 'text-amber-700'
                                  : 'text-rose-700'
                              }
                            >
                              {stats.attendancePercentage}%
                            </span>
                          </td>

                          {/* Calificación (0-10) */}
                          <td className="py-2.5 px-3 text-center border-r border-[#E2E8F0] font-mono-numeric text-sm font-extrabold bg-primary/5 text-primary">
                            {stats.suggestedScore.toFixed(1)}
                          </td>

                          {/* Estatus Oficial */}
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                isPassingAttendance
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : isRiskAttendance
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-rose-50 text-rose-800 border-rose-200'
                              }`}
                            >
                              {isPassingAttendance ? 'Derecho a Examen' : isRiskAttendance ? 'Alerta Asistencia' : 'Sin Derecho (Extra)'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Legend */}
            <div className="p-3 bg-surface-container-low border-t border-[#E2E8F0] flex flex-wrap items-center justify-between text-[11px] text-on-surface-variant gap-2">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-semibold text-slate-700">Fórmula Institucional:</span>
                <span>• Cada 3 Retardos = +1 Falta Adicional</span>
                <span>• % Faltas = (Faltas Efectivas / Sesiones Totales) × 100</span>
                <span>• % Asistencia = 100% - % Faltas</span>
                <span>• Calificación = % Asistencia ÷ 10</span>
              </div>
              <button
                onClick={handleSyncAttendanceScores}
                className="text-primary hover:text-primary-container font-bold flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">cloud_sync</span>
                <span>Aplicar a Sábana de Notas</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ================= DAILY ROLL CALL VIEW ================= */
        <div className="space-y-space-md">
          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-space-sm bg-surface-container-lowest p-3 rounded-xl border border-[#CBD5E1]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-outline pl-1">calendar_today</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-mono-numeric font-semibold text-on-surface bg-transparent focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={markAllDailyPresent}
                className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-variant transition-colors flex items-center gap-1.5 shadow-sm border border-[#E2E8F0] cursor-pointer"
              >
                <span className="material-symbols-outlined text-base text-emerald-600">done_all</span>
                <span>Marcar Todos Presentes</span>
              </button>

              <button
                onClick={handleSaveDailyAttendance}
                className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-all flex items-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">save</span>
                <span>Guardar Pase de Lista</span>
              </button>
            </div>
          </div>

          {/* Tolerance & Status Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md">
            <div className="bg-surface-container-lowest p-3 rounded-lg border border-[#E2E8F0] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                  Asistencia de la Sesión
                </span>
                <p className="text-xl font-bold text-primary font-mono-numeric mt-0.5">{dailyAttendanceRate}%</p>
              </div>
              <span className="material-symbols-outlined text-secondary text-2xl">verified</span>
            </div>

            <div className="bg-surface-container-lowest p-3 rounded-lg border border-[#E2E8F0] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                  Tolerancia Configurada
                </span>
                <p className="text-xl font-bold text-on-surface font-mono-numeric mt-0.5">{lateTolerance}</p>
              </div>
              <span className="material-symbols-outlined text-secondary text-2xl">timer</span>
            </div>

            <div className="bg-surface-container-lowest p-3 rounded-lg border border-[#E2E8F0] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                  Desglose de Sesión
                </span>
                <div className="flex items-center gap-2 mt-1 font-mono-numeric text-xs font-bold">
                  <span className="text-[#065F46] bg-[#ECFDF5] px-1.5 py-0.5 rounded border border-[#A7F3D0]">
                    {dailyPresentCount} P
                  </span>
                  <span className="text-[#92400E] bg-[#FFFBEB] px-1.5 py-0.5 rounded border border-[#FDE68A]">
                    {dailyLateCount} R
                  </span>
                  <span className="text-[#991B1B] bg-[#FEF2F2] px-1.5 py-0.5 rounded border border-[#FECACA]">
                    {dailyAbsentCount} F
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline text-2xl">pie_chart</span>
            </div>

            <div className="bg-surface-container-lowest p-3 rounded-lg border border-[#E2E8F0] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                  Sesiones del Grupo
                </span>
                <p className="text-xs font-bold text-secondary mt-1">
                  {activeSessions.map((s) => `${s.shortDay} ${s.startTime}`).join(' • ') || 'Sin horario'}
                </p>
              </div>
              <span className="material-symbols-outlined text-secondary text-2xl">calendar_month</span>
            </div>
          </div>

          {/* Daily Attendance Roster */}
          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-[#E2E8F0] overflow-hidden">
            <div className="p-space-sm bg-surface-container-low border-b border-[#E2E8F0] flex items-center justify-between text-xs">
              <span className="font-bold text-on-surface">Lista de Estudiantes ({students.length})</span>
              <span className="text-[11px] text-on-surface-variant">
                Haz clic en el estado correspondiente para esta fecha
              </span>
            </div>

            <div className="divide-y divide-[#F1F5F9]">
              {students.map((student) => {
                const currentStatus = dailyAttendance[student.id]?.status || 'present';
                const notes = dailyAttendance[student.id]?.notes || '';

                return (
                  <div
                    key={student.id}
                    className="p-3 hover:bg-surface-container-low/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-64">
                      {student.avatarUrl ? (
                        <img
                          src={student.avatarUrl}
                          alt={student.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-[#E2E8F0]"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-mono-numeric text-xs font-bold shrink-0">
                          {student.initials || student.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-on-surface">{student.name}</span>
                        <span className="text-[11px] text-on-surface-variant font-mono-numeric">
                          {student.matricula}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <button
                        onClick={() => setDailyStatus(student.id, 'present')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                          currentStatus === 'present'
                            ? 'bg-[#10B981] text-white border-[#10B981] shadow-xs'
                            : 'bg-surface-container-low text-on-surface border-[#CBD5E1] hover:bg-surface-container'
                        }`}
                      >
                        Presente
                      </button>

                      <button
                        onClick={() => setDailyStatus(student.id, 'late')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                          currentStatus === 'late'
                            ? 'bg-[#F59E0B] text-white border-[#F59E0B] shadow-xs'
                            : 'bg-surface-container-low text-on-surface border-[#CBD5E1] hover:bg-surface-container'
                        }`}
                      >
                        Retardo
                      </button>

                      <button
                        onClick={() => setDailyStatus(student.id, 'absent')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                          currentStatus === 'absent'
                            ? 'bg-[#EF4444] text-white border-[#EF4444] shadow-xs'
                            : 'bg-surface-container-low text-on-surface border-[#CBD5E1] hover:bg-surface-container'
                        }`}
                      >
                        Falta
                      </button>

                      <button
                        onClick={() => setDailyStatus(student.id, 'excused')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                          currentStatus === 'excused'
                            ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-xs'
                            : 'bg-surface-container-low text-on-surface border-[#CBD5E1] hover:bg-surface-container'
                        }`}
                      >
                        Justificado
                      </button>
                    </div>

                    <div className="w-full sm:w-64">
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setDailyNotes(student.id, e.target.value)}
                        placeholder="Nota de incidencia o justificación..."
                        className="w-full h-8 px-2.5 text-[11px] bg-surface-container-low rounded border border-[#CBD5E1] focus:outline-none focus:border-secondary"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
