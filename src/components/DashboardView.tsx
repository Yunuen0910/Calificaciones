/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Group } from '../types';

interface DashboardViewProps {
  groups: Group[];
  activeCycle?: string;
  scores?: Record<string, Record<string, number>>;
  onOpenCreateGroup: () => void;
  onSelectGroupForGrades: (group: Group) => void;
  onSelectGroupForAttendance: (group: Group) => void;
  onSelectGroupForCriteria: (group: Group) => void;
  onSelectGroupForFinalGrades?: (group: Group) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  groups,
  activeCycle,
  scores,
  onOpenCreateGroup,
  onSelectGroupForGrades,
  onSelectGroupForAttendance,
  onSelectGroupForCriteria,
  onSelectGroupForFinalGrades,
}) => {
  const [filterShift, setFilterShift] = useState<'Todos' | 'Matutino' | 'Vespertino' | 'Mixto'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroups = groups.filter((g) => {
    const matchesShift = filterShift === 'Todos' || g.shift === filterShift;
    const matchesSearch = 
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      g.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.classroom.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesShift && matchesSearch;
  });

  const totalStudents = groups.reduce((acc, g) => acc + g.students.length, 0);
  const totalCapacity = groups.reduce((acc, g) => acc + g.capacity, 0);

  // Compute real average grade across all students in active groups
  const averageGrade = React.useMemo(() => {
    if (totalStudents === 0 || !scores) return null;
    let sum = 0;
    let count = 0;
    for (const group of groups) {
      for (const student of group.students) {
        const studentScores = scores[student.id];
        if (studentScores) {
          const values = Object.values(studentScores);
          for (const v of values) {
            if (typeof v === 'number' && !isNaN(v)) {
              sum += v;
              count++;
            }
          }
        }
      }
    }
    return count > 0 ? sum / count : null;
  }, [groups, scores, totalStudents]);

  // Real attendance: check if any group has attendance sessions recorded, otherwise null
  const averageAttendance = React.useMemo(() => {
    if (totalStudents === 0) return null;
    try {
      const savedAttendance = localStorage.getItem('aulagrade_attendance_records');
      if (savedAttendance) {
        const records = JSON.parse(savedAttendance);
        if (records && typeof records === 'object') {
          let presents = 0;
          let total = 0;
          for (const dateKey of Object.keys(records)) {
            const dayRecords = records[dateKey];
            if (dayRecords && typeof dayRecords === 'object') {
              for (const status of Object.values(dayRecords)) {
                if (status === 'present') presents++;
                if (status === 'late') presents += 0.8;
                total++;
              }
            }
          }
          if (total > 0) return Math.round((presents / total) * 100);
        }
      }
    } catch {
      // ignore
    }
    return null;
  }, [totalStudents]);

  return (
    <div className="flex flex-col w-full pb-16 px-space-lg pt-space-lg">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-lg border-b border-[#E2E8F0]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
            <span className="material-symbols-outlined text-sm">dashboard</span>
            <span>Gestión Académica</span>
            <span>•</span>
            <span className="text-secondary font-semibold">{activeCycle || 'Ciclo Escolar Activo'}</span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Dashboard de Grupos</h1>
          <p className="text-xs text-on-surface-variant">
            Administra tus asignaturas activas, consulta métricas de ocupación y accede rápidamente al cuaderno de notas o pase de lista.
          </p>
        </div>

        <button
          onClick={onOpenCreateGroup}
          className="px-space-lg py-2.5 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-all flex items-center gap-space-xs shadow-md shadow-primary/20 hover:shadow-lg self-start md:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          <span>Dar de Alta Nuevo Grupo</span>
        </button>
      </header>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md py-space-lg">
        <div className="bg-surface-container-lowest rounded-xl p-space-md border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">Grupos Activos</span>
            <span className="text-2xl font-bold text-on-surface font-mono-numeric mt-1">{groups.length}</span>
            {groups.length > 0 ? (
              <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5 mt-0.5">
                <span className="material-symbols-outlined text-xs">check_circle</span> 100% operativos
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                Sin materias registradas
              </span>
            )}
          </div>
          <div className="w-10 h-10 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">class</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-md border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">Alumnos Matriculados</span>
            <span className="text-2xl font-bold text-on-surface font-mono-numeric mt-1">{totalStudents}</span>
            <span className="text-[11px] text-on-surface-variant mt-0.5">
              {totalCapacity > 0
                ? `De ${totalCapacity} cupos totales (${Math.round((totalStudents / totalCapacity) * 100)}%)`
                : '0 cupos asignados'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">group</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-md border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">Promedio General</span>
            <span className="text-2xl font-bold text-secondary font-mono-numeric mt-1">
              {averageGrade !== null ? `${averageGrade.toFixed(1)} / 10` : '—'}
            </span>
            {averageGrade !== null ? (
              <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5 mt-0.5">
                <span className="material-symbols-outlined text-xs">trending_up</span> Promedio del ciclo
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 mt-0.5">
                Sin calificaciones registradas
              </span>
            )}
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">insights</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-md border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">Asistencia Promedio</span>
            <span className="text-2xl font-bold text-on-surface font-mono-numeric mt-1">
              {averageAttendance !== null ? `${averageAttendance}%` : '—'}
            </span>
            <span className="text-[11px] text-on-surface-variant mt-0.5">
              {averageAttendance !== null ? 'Tolerancia promedio 10 min' : 'Sin pases de lista registrados'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">fact_check</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-sm pb-space-md">
        <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-[#E2E8F0]">
          {(['Todos', 'Matutino', 'Vespertino', 'Mixto'] as const).map((shift) => (
            <button
              key={shift}
              onClick={() => setFilterShift(shift)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                filterShift === shift
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {shift}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-outline text-base">search</span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar por código o aula..."
            className="w-full h-9 pl-8 pr-3 text-xs bg-surface-container-lowest rounded-lg border border-[#CBD5E1] focus:outline-none focus:border-secondary"
          />
        </div>
      </div>

      {/* Groups Grid or Empty State */}
      {groups.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl border-2 border-dashed border-[#CBD5E1] p-12 text-center flex flex-col items-center justify-center my-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-primary flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl">school</span>
          </div>
          <h3 className="text-lg font-bold text-on-surface">No tienes grupos ni materias asignadas</h3>
          <p className="text-xs text-on-surface-variant max-w-md mt-1 leading-relaxed">
            Tu cuenta docente está activa pero aún no tiene asignaturas asignadas en este ciclo escolar. Puedes crear tu primera materia ahora mismo o solicitar al administrador escolar que vincule tus grupos.
          </p>
          <button
            onClick={onOpenCreateGroup}
            className="mt-6 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container transition-all flex items-center gap-2 shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>Dar de Alta mi Primer Grupo</span>
          </button>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl border border-[#E2E8F0] p-10 text-center my-4">
          <span className="material-symbols-outlined text-3xl text-outline mb-2">search_off</span>
          <p className="text-xs text-on-surface font-semibold">No se encontraron materias</p>
          <p className="text-[11px] text-on-surface-variant mt-0.5">Ningún grupo coincide con los filtros de búsqueda o turno seleccionados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-lg">
        {filteredGroups.map((group) => {
          const capPercent = Math.min(100, Math.round((group.students.length / (group.capacity || 1)) * 100 * 10) / 10);
          const activeSessions = group.schedule.filter(s => s.active);
          const daysText = activeSessions.map(s => {
            switch (s.day) {
              case 'Lunes': return 'Lun';
              case 'Martes': return 'Mar';
              case 'Miércoles': return 'Mié';
              case 'Jueves': return 'Jue';
              case 'Viernes': return 'Vie';
            }
          }).join(', ');

          return (
            <div
              key={group.id}
              className="bg-surface-container-lowest rounded-xl shadow-xs border border-[#E2E8F0] hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Header */}
              <div className="p-space-md flex flex-col gap-space-sm border-b border-[#F1F5F9] bg-surface-container-low/30">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-2xl">science</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] text-on-surface-variant font-mono-numeric">
                        {group.code} • {group.semester}
                      </span>
                      <h3 className="text-sm font-bold text-on-surface leading-tight group-hover:text-primary transition-colors">
                        {group.name}
                      </h3>
                    </div>
                  </div>
                  <span className="px-space-sm py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-semibold">
                    {group.section}
                  </span>
                </div>

                {/* Badges Grid */}
                <div className="grid grid-cols-2 gap-space-xs text-xs text-on-surface-variant pt-1">
                  <div className="flex items-center gap-1.5 bg-surface-container-lowest p-space-xs rounded border border-[#E2E8F0]">
                    <span className="material-symbols-outlined text-secondary text-base">meeting_room</span>
                    <span className="truncate">{group.classroom}</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-surface-container-lowest p-space-xs rounded border border-[#E2E8F0]">
                    <span className="material-symbols-outlined text-secondary text-base">wb_sunny</span>
                    <span>Turno {group.shift}</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-surface-container-lowest p-space-xs rounded border border-[#E2E8F0]">
                    <span className="material-symbols-outlined text-secondary text-base">calendar_month</span>
                    <span className="truncate">{daysText || 'Por definir'}</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-surface-container-lowest p-space-xs rounded border border-[#E2E8F0]">
                    <span className="material-symbols-outlined text-secondary text-base">group</span>
                    <span>{group.students.length} / {group.capacity} Alumnos</span>
                  </div>
                </div>

                {/* Capacity meter */}
                <div className="flex flex-col gap-1 pt-1">
                  <div className="flex justify-between text-[11px] text-on-surface-variant">
                    <span>Ocupación</span>
                    <span className="font-mono-numeric font-semibold">{capPercent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary rounded-full"
                      style={{ width: `${capPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-space-sm bg-surface-container-lowest flex items-center justify-between gap-1">
                <button
                  onClick={() => onSelectGroupForGrades(group)}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-[#E2E8F0]"
                  title="Abrir matriz de calificaciones"
                >
                  <span className="material-symbols-outlined text-base">edit_note</span>
                  <span>Notas</span>
                </button>

                <button
                  onClick={() => onSelectGroupForAttendance(group)}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-[#E2E8F0]"
                  title="Pasar lista hoy"
                >
                  <span className="material-symbols-outlined text-base">how_to_reg</span>
                  <span>Asistencia</span>
                </button>

                {onSelectGroupForFinalGrades && (
                  <button
                    onClick={() => onSelectGroupForFinalGrades(group)}
                    className="p-1.5 rounded-lg text-primary hover:bg-surface-container-high transition-colors cursor-pointer border border-primary/20"
                    title="Ver Calificaciones Finales y Acta"
                  >
                    <span className="material-symbols-outlined text-base">workspace_premium</span>
                  </button>
                )}

                <button
                  onClick={() => onSelectGroupForCriteria(group)}
                  className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                  title="Configurar Criterios"
                >
                  <span className="material-symbols-outlined text-base">tune</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
