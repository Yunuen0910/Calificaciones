/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Group, AttendanceStatus } from '../types';

interface AttendanceViewProps {
  groups: Group[];
  selectedGroupId?: string;
  onSelectGroup: (groupId: string) => void;
  onOpenCreateGroup: () => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  groups,
  selectedGroupId,
  onSelectGroup,
  onOpenCreateGroup,
}) => {
  const currentGroup = groups.find((g) => g.id === selectedGroupId) || groups[0];

  const [selectedDate, setSelectedDate] = useState('2026-10-21'); // Today
  const [attendance, setAttendance] = useState<Record<string, { status: AttendanceStatus; notes: string }>>({
    'std-1': { status: 'present', notes: '' },
    'std-2': { status: 'present', notes: '' },
    'std-3': { status: 'late', notes: 'Entró a las 07:08 AM con tolerancia' },
    'std-4': { status: 'absent', notes: 'Sin aviso previo' },
    'std-5': { status: 'present', notes: '' },
    'std-6': { status: 'excused', notes: 'Justificante médico presentado' },
  });
  const [saveToast, setSaveToast] = useState(false);

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
  const activeSessions = schedule.filter(s => s.active);

  // Set individual student status
  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { notes: '' }),
        status
      }
    }));
  };

  const setStudentNotes = (studentId: string, notes: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { status: 'present' }),
        notes
      }
    }));
  };

  // Mark all present
  const markAllPresent = () => {
    const updated: Record<string, { status: AttendanceStatus; notes: string }> = {};
    students.forEach(s => {
      updated[s.id] = { status: 'present', notes: '' };
    });
    setAttendance(updated);
  };

  // Metrics
  const presentCount = students.filter(s => attendance[s.id]?.status === 'present').length;
  const lateCount = students.filter(s => attendance[s.id]?.status === 'late').length;
  const absentCount = students.filter(s => attendance[s.id]?.status === 'absent').length;
  const excusedCount = students.filter(s => attendance[s.id]?.status === 'excused').length;
  const effectivePresent = presentCount + (lateCount * 0.8) + (excusedCount * 1.0);
  const attendanceRate = students.length > 0 
    ? Math.round((effectivePresent / students.length) * 100) 
    : 100;

  const handleSaveAttendance = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  return (
    <div className="flex flex-col w-full pb-16 px-space-lg pt-space-lg">
      {saveToast && (
        <div className="fixed top-20 right-8 z-50 bg-[#1E3A8A] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>Pase de lista registrado y sincronizado en el expediente del ciclo.</span>
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
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Pase de Lista</h1>
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

        {/* Date Selector & Action Controls */}
        <div className="flex items-center gap-space-sm self-start md:self-auto shrink-0">
          <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-lg border border-[#CBD5E1]">
            <span className="material-symbols-outlined text-sm text-outline pl-1">calendar_today</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-mono-numeric font-semibold text-on-surface bg-transparent focus:outline-none"
            />
          </div>

          <button
            onClick={markAllPresent}
            className="px-3 py-2 rounded-lg bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-variant transition-colors flex items-center gap-1.5 shadow-sm border border-[#E2E8F0] cursor-pointer"
          >
            <span className="material-symbols-outlined text-base text-emerald-600">done_all</span>
            <span>Marcar Todos Presentes</span>
          </button>

          <button
            onClick={handleSaveAttendance}
            className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-all flex items-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">save</span>
            <span>Guardar Registro</span>
          </button>
        </div>
      </header>

      {/* Tolerance & Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md py-space-md">
        <div className="bg-surface-container-lowest p-3 rounded-lg border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Asistencia de la Sesión</span>
            <p className="text-xl font-bold text-primary font-mono-numeric mt-0.5">{attendanceRate}%</p>
          </div>
          <span className="material-symbols-outlined text-secondary text-2xl">verified</span>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded-lg border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Tolerancia Configurada</span>
            <p className="text-xl font-bold text-on-surface font-mono-numeric mt-0.5">{lateTolerance}</p>
          </div>
          <span className="material-symbols-outlined text-secondary text-2xl">timer</span>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded-lg border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Desglose de Asistencias</span>
            <div className="flex items-center gap-2 mt-1 font-mono-numeric text-xs font-bold">
              <span className="text-[#065F46] bg-[#ECFDF5] px-1.5 py-0.5 rounded border border-[#A7F3D0]">{presentCount} P</span>
              <span className="text-[#92400E] bg-[#FFFBEB] px-1.5 py-0.5 rounded border border-[#FDE68A]">{lateCount} R</span>
              <span className="text-[#991B1B] bg-[#FEF2F2] px-1.5 py-0.5 rounded border border-[#FECACA]">{absentCount} F</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-outline text-2xl">pie_chart</span>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded-lg border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Sesiones de la Materia</span>
            <p className="text-xs font-bold text-secondary mt-1">
              {activeSessions.map(s => `${s.shortDay} ${s.startTime}`).join(' • ') || 'Sin horario'}
            </p>
          </div>
          <span className="material-symbols-outlined text-secondary text-2xl">calendar_month</span>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-[#E2E8F0] overflow-hidden">
        <div className="p-space-sm bg-surface-container-low border-b border-[#E2E8F0] flex items-center justify-between text-xs">
          <span className="font-bold text-on-surface">Lista de Estudiantes ({students.length})</span>
          <span className="text-[11px] text-on-surface-variant">Usa los botones para registrar el estado de cada estudiante</span>
        </div>

        <div className="divide-y divide-[#F1F5F9]">
          {students.map((student) => {
            const currentStatus = attendance[student.id]?.status || 'present';
            const notes = attendance[student.id]?.notes || '';

            return (
              <div 
                key={student.id} 
                className="p-3 hover:bg-surface-container-low/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Student Info */}
                <div className="flex items-center gap-3 min-w-64">
                  {student.avatarUrl ? (
                    <img src={student.avatarUrl} alt={student.name} className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-[#E2E8F0]" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-mono-numeric text-xs font-bold shrink-0">
                      {student.initials || student.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs text-on-surface">{student.name}</span>
                    <span className="text-[11px] text-on-surface-variant font-mono-numeric">{student.matricula}</span>
                  </div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <button
                    onClick={() => setStudentStatus(student.id, 'present')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      currentStatus === 'present'
                        ? 'bg-[#10B981] text-white border-[#10B981] shadow-xs'
                        : 'bg-surface-container-low text-on-surface border-[#CBD5E1] hover:bg-surface-container'
                    }`}
                  >
                    Presente
                  </button>

                  <button
                    onClick={() => setStudentStatus(student.id, 'late')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      currentStatus === 'late'
                        ? 'bg-[#F59E0B] text-white border-[#F59E0B] shadow-xs'
                        : 'bg-surface-container-low text-on-surface border-[#CBD5E1] hover:bg-surface-container'
                    }`}
                  >
                    Retardo
                  </button>

                  <button
                    onClick={() => setStudentStatus(student.id, 'absent')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      currentStatus === 'absent'
                        ? 'bg-[#EF4444] text-white border-[#EF4444] shadow-xs'
                        : 'bg-surface-container-low text-on-surface border-[#CBD5E1] hover:bg-surface-container'
                    }`}
                  >
                    Falta
                  </button>

                  <button
                    onClick={() => setStudentStatus(student.id, 'excused')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      currentStatus === 'excused'
                        ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-xs'
                        : 'bg-surface-container-low text-on-surface border-[#CBD5E1] hover:bg-surface-container'
                    }`}
                  >
                    Justificado
                  </button>
                </div>

                {/* Notes Input */}
                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setStudentNotes(student.id, e.target.value)}
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
  );
};
