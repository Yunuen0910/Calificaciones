/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Group, Student, SessionSchedule, WeekDay, EvaluationStructure, AcademicCycle, User } from '../types';
import { INITIAL_STUDENTS } from '../data/mockData';

interface AltaGrupoViewProps {
  onCancel: () => void;
  onGroupCreated: (newGroup: Group) => void;
  existingGroups: Group[];
  activeCycle?: string;
  cycles?: AcademicCycle[];
  currentUser?: User | null;
}

export const AltaGrupoView: React.FC<AltaGrupoViewProps> = ({
  onCancel,
  onGroupCreated,
  existingGroups,
  activeCycle = 'Ciclo 2024-2025 • P2',
  cycles = [],
  currentUser = null,
}) => {
  // Form State
  const [subjectName, setSubjectName] = useState('Física Cuántica I');
  const [subjectCode, setSubjectCode] = useState('FIS-302');
  const [educationLevel, setEducationLevel] = useState('Licenciatura / Universidad');
  const [gradeNumber, setGradeNumber] = useState('3');
  const [periodType, setPeriodType] = useState('Semestre');
  const semester = `${gradeNumber}° ${periodType}`;
  const [section, setSection] = useState<'Grupo A' | 'Grupo B' | 'Grupo C'>('Grupo A');
  const [shift, setShift] = useState<'Matutino' | 'Vespertino' | 'Mixto'>('Matutino');
  const [academicCycle, setAcademicCycle] = useState(activeCycle);
  const [classroom, setClassroom] = useState('Edificio B - Aula 204');
  const [capacity, setCapacity] = useState(35);

  // Schedules state
  const [schedules, setSchedules] = useState<SessionSchedule[]>([
    { day: 'Lunes', shortDay: 'LUN', active: true, startTime: '07:00', endTime: '08:40', sessionType: 'Teoría (100 min)' },
    { day: 'Martes', shortDay: 'MAR', active: false, startTime: '07:00', endTime: '08:40', sessionType: 'Sin sesión' },
    { day: 'Miércoles', shortDay: 'MIÉ', active: true, startTime: '07:00', endTime: '08:40', sessionType: 'Laboratorio (100 min)' },
    { day: 'Jueves', shortDay: 'JUE', active: false, startTime: '07:00', endTime: '08:40', sessionType: 'Sin sesión' },
    { day: 'Viernes', shortDay: 'VIE', active: true, startTime: '08:50', endTime: '09:40', sessionType: 'Taller / Resolución (50 min)' },
  ]);

  const [syncCalendar, setSyncCalendar] = useState(true);
  const [lateTolerance, setLateTolerance] = useState('10 min');

  // Criteria & Weights
  const [criteriaPreset, setCriteriaPreset] = useState<'aulagrade' | 'copy' | 'scratch'>('aulagrade');
  const [evaluationStructure, setEvaluationStructure] = useState<EvaluationStructure>('parciales');
  const [numberOfPeriods, setNumberOfPeriods] = useState<number>(3);
  const [weights, setWeights] = useState({
    homework: 35,
    exams: 20,
    attendance: 20,
    participation: 15,
    selfEval: 10,
  });
  const [gradeScale, setGradeScale] = useState<'decimal' | 'centesimal' | 'letters'>('decimal');
  const [minPassingGrade, setMinPassingGrade] = useState(7.0);

  // Roster
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS.slice(0, 4));
  const [activeEnrollTab, setActiveEnrollTab] = useState<'upload' | 'sis' | 'manual'>('upload');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showSisSyncModal, setShowSisSyncModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [saveDraftMessage, setSaveDraftMessage] = useState(false);

  // Active sessions count
  const activeSessions = schedules.filter(s => s.active);
  const activeDaysString = activeSessions.map(s => {
    switch (s.day) {
      case 'Lunes': return 'Lun';
      case 'Martes': return 'Mar';
      case 'Miércoles': return 'Mié';
      case 'Jueves': return 'Jue';
      case 'Viernes': return 'Vie';
    }
  }).join(', ');

  const totalWeight = weights.homework + weights.exams + weights.attendance + weights.participation + weights.selfEval;
  const capacityPercent = Math.min(100, Math.round((students.length / (capacity || 1)) * 100 * 10) / 10);

  // Toggle active day
  const toggleDay = (day: WeekDay) => {
    setSchedules(prev => prev.map(s => {
      if (s.day === day) {
        const nextActive = !s.active;
        return {
          ...s,
          active: nextActive,
          sessionType: nextActive ? (s.sessionType === 'Sin sesión' ? 'Teoría (100 min)' : s.sessionType) : 'Sin sesión'
        };
      }
      return s;
    }));
  };

  // Change schedule row times
  const updateSchedule = (day: WeekDay, field: 'startTime' | 'endTime' | 'sessionType', val: string) => {
    setSchedules(prev => prev.map(s => s.day === day ? { ...s, [field]: val } : s));
  };

  // Delete session
  const deleteSession = (day: WeekDay) => {
    setSchedules(prev => prev.map(s => s.day === day ? { ...s, active: false, sessionType: 'Sin sesión' } : s));
  };

  // Download real sample Excel/CSV template
  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Matricula,Nombre Completo,Correo Institucional\n" +
      "AG-2024-0501,Carlos Eduardo Nava,c.nava@aulagrade.edu\n" +
      "AG-2024-0502,Ana Laura Gómez,a.gomez@aulagrade.edu\n" +
      "AG-2024-0503,Luis Fernando Castro,l.castro@aulagrade.edu\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Plantilla_AulaGrade_Matriculacion.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle CSV file simulation on drop or input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLElement>) => {
    let files: FileList | null = null;
    if ('dataTransfer' in e) {
      e.preventDefault();
      files = e.dataTransfer.files;
    } else if (e.target.files) {
      files = e.target.files;
    }

    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const lines = text.split('\n').filter(l => l.trim().length > 0);
          // skip header if contains 'Matricula'
          const startIdx = lines[0].toLowerCase().includes('matricula') ? 1 : 0;
          const parsedStudents: Student[] = [];
          for (let i = startIdx; i < lines.length; i++) {
            const parts = lines[i].split(',').map(p => p.trim());
            if (parts.length >= 2) {
              const matricula = parts[0] || `AG-2024-${Math.floor(1000 + Math.random() * 9000)}`;
              const name = parts[1] || 'Estudiante Importado';
              const email = parts[2] || `${name.toLowerCase().replace(/\s+/g, '.')}@aulagrade.edu`;
              parsedStudents.push({
                id: `imp-${Date.now()}-${i}`,
                matricula,
                name,
                email,
                initials: name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase(),
                status: 'ready'
              });
            }
          }
          if (parsedStudents.length > 0) {
            setStudents(prev => [...prev, ...parsedStudents]);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  // Add manual student
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    const matricula = newStudentId.trim() || `AG-2024-${Math.floor(1000 + Math.random() * 9000)}`;
    const email = newStudentEmail.trim() || `${newStudentName.trim().toLowerCase().replace(/\s+/g, '.')}@aulagrade.edu`;
    const initials = newStudentName.trim().split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    const newStudent: Student = {
      id: `std-${Date.now()}`,
      matricula,
      name: newStudentName.trim(),
      email,
      initials,
      status: 'ready'
    };
    setStudents(prev => [...prev, newStudent]);
    setNewStudentName('');
    setNewStudentId('');
    setNewStudentEmail('');
    setShowAddStudentModal(false);
  };

  // Delete student from roster
  const removeStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  // Copy criteria preset from existing group
  const handleSelectPreset = (preset: 'aulagrade' | 'copy' | 'scratch') => {
    setCriteriaPreset(preset);
    if (preset === 'aulagrade') {
      setWeights({ homework: 35, exams: 20, attendance: 20, participation: 15, selfEval: 10 });
    } else if (preset === 'copy' && existingGroups.length > 0) {
      const g = existingGroups[0];
      setWeights(g.criteria.weights);
    } else if (preset === 'scratch') {
      setWeights({ homework: 20, exams: 20, attendance: 20, participation: 20, selfEval: 20 });
    }
  };

  // Final submit: Create and activate group
  const handleCreateGroup = () => {
    const cycleObj = cycles.find(c => c.name === academicCycle);
    const newGroup: Group = {
      id: `grp-${subjectCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
      name: subjectName.trim() || 'Nueva Asignatura',
      code: subjectCode.trim().toUpperCase() || 'COD-101',
      educationLevel,
      semester,
      section,
      shift,
      academicCycle,
      cycleId: cycleObj?.id,
      teacherId: currentUser?.id,
      teacherName: currentUser?.name,
      classroom: classroom.trim() || 'Aula General',
      capacity: Number(capacity) || 35,
      syncCalendar,
      lateTolerance,
      schedule: schedules,
      criteria: {
        preset: criteriaPreset,
        evaluationStructure,
        numberOfPeriods: Number(numberOfPeriods) || 3,
        weights,
        scale: gradeScale,
        minPassingGrade: Number(minPassingGrade) || 7.0
      },
      students,
      createdAt: new Date().toISOString()
    };
    onGroupCreated(newGroup);
  };

  // Save Draft
  const handleSaveDraft = () => {
    localStorage.setItem('aulagrade_group_draft', JSON.stringify({
      subjectName,
      subjectCode,
      educationLevel,
      gradeNumber,
      periodType,
      semester,
      section,
      shift,
      classroom,
      capacity,
      evaluationStructure,
      numberOfPeriods,
      weights,
      studentsCount: students.length
    }));
    setSaveDraftMessage(true);
    setTimeout(() => setSaveDraftMessage(false), 3000);
  };

  // Checklist verification
  const isBasicInfoValid = subjectName.trim().length > 0 && subjectCode.trim().length > 0;
  const isScheduleValid = activeSessions.length > 0;
  const isCriteriaValid = totalWeight === 100;
  const isRosterValid = students.length > 0;
  const completedSteps = [isBasicInfoValid, isScheduleValid, isCriteriaValid, isRosterValid].filter(Boolean).length;

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Toast Alert for Draft Saved */}
      {saveDraftMessage && (
        <div className="fixed top-20 right-8 z-50 bg-[#1E3A8A] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>Borrador guardado exitosamente en tu navegador.</span>
        </div>
      )}

      {/* Top Context Header & Actions */}
      <header className="px-space-lg pt-space-lg pb-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <nav className="flex items-center gap-space-xs text-on-surface-variant text-xs">
            <button 
              onClick={onCancel}
              className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">dashboard</span>
              <span>Dashboard de Grupos</span>
            </button>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-on-surface font-semibold">Alta de Nuevo Grupo</span>
          </nav>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Dar de Alta Nuevo Grupo</h1>
          <p className="text-sm text-on-surface-variant max-w-2xl">
            Configura la información académica, asigna horarios, define el esquema inicial de evaluación e importa la lista de estudiantes para este ciclo.
          </p>
        </div>

        {/* Global Form Actions */}
        <div className="flex items-center gap-space-sm self-start md:self-auto shrink-0">
          <button 
            onClick={onCancel}
            className="px-space-md py-space-sm rounded-lg bg-surface-container-high text-on-surface text-sm font-semibold hover:bg-surface-variant transition-colors flex items-center gap-space-xs shadow-sm cursor-pointer" 
            type="button"
          >
            <span className="material-symbols-outlined text-lg">close</span>
            <span>Cancelar</span>
          </button>

          <button 
            onClick={handleSaveDraft}
            className="px-space-md py-space-sm rounded-lg bg-surface-container-lowest text-on-surface text-sm font-semibold hover:bg-surface-container-low transition-colors flex items-center gap-space-xs shadow-sm border border-[#E2E8F0] cursor-pointer" 
            type="button"
          >
            <span className="material-symbols-outlined text-lg">save</span>
            <span>Guardar Borrador</span>
          </button>

          <button 
            onClick={handleCreateGroup}
            className="px-space-lg py-space-sm rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container transition-all flex items-center gap-space-xs shadow-md shadow-primary/20 hover:shadow-lg cursor-pointer" 
            type="button"
          >
            <span className="material-symbols-outlined text-lg">check_circle</span>
            <span>Crear y Activar Grupo</span>
          </button>
        </div>
      </header>

      {/* Step Progress Indicator Bar */}
      <div className="px-space-lg mb-space-lg">
        <div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm border border-[#E2E8F0] flex items-center justify-between gap-space-sm overflow-x-auto">
          <a 
            href="#etapa-1"
            className="flex items-center gap-space-sm min-w-max px-space-sm py-1.5 rounded-lg bg-surface-container-high text-primary text-xs font-bold hover:bg-surface-container transition-colors"
          >
            <span className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center font-mono-numeric text-xs font-bold">1</span>
            <span>Información Académica</span>
          </a>
          <div className="h-0.5 w-8 bg-surface-container-highest shrink-0"></div>

          <a 
            href="#etapa-2"
            className="flex items-center gap-space-sm min-w-max px-space-sm py-1.5 rounded-lg text-on-surface-variant text-xs font-medium hover:bg-surface-container-low transition-colors"
          >
            <span className="w-5 h-5 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-mono-numeric text-xs font-bold">2</span>
            <span>Horarios y Sesiones</span>
          </a>
          <div className="h-0.5 w-8 bg-surface-container-highest shrink-0"></div>

          <a 
            href="#etapa-3"
            className="flex items-center gap-space-sm min-w-max px-space-sm py-1.5 rounded-lg text-on-surface-variant text-xs font-medium hover:bg-surface-container-low transition-colors"
          >
            <span className="w-5 h-5 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-mono-numeric text-xs font-bold">3</span>
            <span>Criterios y Ponderaciones</span>
          </a>
          <div className="h-0.5 w-8 bg-surface-container-highest shrink-0"></div>

          <a 
            href="#etapa-4"
            className="flex items-center gap-space-sm min-w-max px-space-sm py-1.5 rounded-lg text-on-surface-variant text-xs font-medium hover:bg-surface-container-low transition-colors"
          >
            <span className="w-5 h-5 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-mono-numeric text-xs font-bold">4</span>
            <span>Matriculación de Alumnos</span>
          </a>
        </div>
      </div>

      {/* Primary Canvas Split: 8 cols Form Engine / 4 cols Live Preview Sheet */}
      <div className="px-space-lg grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        {/* LEFT: Multi-block configuration stream (8 Cols) */}
        <div className="xl:col-span-8 flex flex-col gap-space-lg min-w-0">
          
          {/* BLOQUE 1: Información Académica Básica */}
          <section id="etapa-1" className="bg-surface-container-lowest rounded-xl shadow-sm border border-[#E2E8F0] p-space-lg flex flex-col gap-space-md relative overflow-hidden">
            <div className="flex items-center justify-between pb-space-sm border-b border-[#F1F5F9]">
              <div className="flex items-center gap-space-sm">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">school</span>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Etapa 1</span>
                  <h2 className="text-base text-on-surface font-semibold">Información Académica Básica</h2>
                </div>
              </div>
              <span className="px-space-sm py-0.5 rounded-full bg-surface-container text-primary font-mono-numeric text-xs font-semibold">
                Obligatorio
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md pt-space-xs">
              {/* Nombre de Asignatura */}
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface flex items-center justify-between">
                  <span>Nombre de la Asignatura / Materia <span className="text-error">*</span></span>
                  <span className="text-[11px] text-on-surface-variant">Oficial</span>
                </label>
                <input 
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full h-10 px-space-md bg-surface-container-lowest rounded-lg text-sm text-on-surface border border-[#CBD5E1] focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none shadow-sm" 
                  placeholder="Ej. Álgebra Lineal, Química Orgánica..." 
                  type="text" 
                />
              </div>

              {/* Código o Clave */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">Código o Clave <span className="text-error">*</span></label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-outline text-lg pointer-events-none">tag</span>
                  <input 
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
                    className="w-full h-10 pl-9 pr-space-md bg-surface-container-lowest rounded-lg font-mono-numeric text-sm text-on-surface uppercase border border-[#CBD5E1] focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none shadow-sm" 
                    placeholder="Ej. MAT-301" 
                    type="text" 
                  />
                </div>
              </div>

              {/* Nivel Educativo */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">Nivel Educativo</label>
                <select 
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full h-10 px-space-md bg-surface-container-lowest rounded-lg text-sm text-on-surface border border-[#CBD5E1] focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none shadow-sm cursor-pointer"
                >
                  <option>Licenciatura / Universidad</option>
                  <option>Bachillerato / Preparatoria</option>
                  <option>Secundaria</option>
                  <option>Posgrado / Maestría</option>
                </select>
              </div>

              {/* Grado / Periodo */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface flex items-center justify-between">
                  <span>Grado y Modalidad <span className="text-error">*</span></span>
                  <span className="text-[11px] text-secondary font-mono-numeric font-semibold bg-surface-container-low px-1.5 py-0.5 rounded border border-[#E2E8F0]">
                    {gradeNumber}° {periodType}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-space-xs">
                  {/* Selector de 1° a 6° */}
                  <select 
                    value={gradeNumber}
                    onChange={(e) => setGradeNumber(e.target.value)}
                    className="w-full h-10 px-2.5 bg-surface-container-lowest rounded-lg text-xs font-semibold text-on-surface border border-[#CBD5E1] focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none shadow-sm cursor-pointer"
                    title="Selecciona el grado (1° Primero a 6° Sexto)"
                  >
                    <option value="1">1° (Primero)</option>
                    <option value="2">2° (Segundo)</option>
                    <option value="3">3° (Tercero)</option>
                    <option value="4">4° (Cuarto)</option>
                    <option value="5">5° (Quinto)</option>
                    <option value="6">6° (Sexto)</option>
                  </select>

                  {/* Selector de Modalidad / Periodicidad */}
                  <select 
                    value={periodType}
                    onChange={(e) => setPeriodType(e.target.value)}
                    className="w-full h-10 px-2.5 bg-surface-container-lowest rounded-lg text-xs font-semibold text-on-surface border border-[#CBD5E1] focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none shadow-sm cursor-pointer"
                    title="Selecciona si es Semestre, Cuatrimestre, Año Escolar, etc."
                  >
                    <option value="Semestre">Semestre</option>
                    <option value="Cuatrimestre">Cuatrimestre</option>
                    <option value="Año Escolar">Año Escolar</option>
                    <option value="Trimestre">Trimestre</option>
                    <option value="Bimestre">Bimestre</option>
                    <option value="Módulo">Módulo</option>
                  </select>
                </div>
              </div>

              {/* Sección / Grupo */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">Grupo / Sección</label>
                <div className="flex items-center gap-space-xs">
                  {(['Grupo A', 'Grupo B', 'Grupo C'] as const).map((sec) => (
                    <button
                      type="button"
                      key={sec}
                      onClick={() => setSection(sec)}
                      className={`flex-1 h-10 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer border ${
                        section === sec 
                          ? 'bg-primary-container text-on-primary border-primary-container shadow-sm' 
                          : 'bg-surface-container-low text-on-surface border-transparent hover:bg-surface-container'
                      }`}
                    >
                      {sec}
                    </button>
                  ))}
                </div>
              </div>

              {/* Turno */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">Turno</label>
                <div className="grid grid-cols-3 gap-space-xs">
                  {(['Matutino', 'Vespertino', 'Mixto'] as const).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setShift(t)}
                      className={`h-10 rounded-lg text-xs font-medium flex items-center justify-center transition-colors cursor-pointer border ${
                        shift === t 
                          ? 'bg-secondary-container text-on-secondary-container border-secondary-container font-semibold shadow-sm' 
                          : 'bg-surface-container-low text-on-surface-variant border-transparent hover:bg-surface-container'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ciclo Escolar */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface flex items-center justify-between">
                  <span>Ciclo Escolar y Periodo</span>
                  <span className="text-[10px] text-primary font-bold">Configuración</span>
                </label>
                {cycles.length > 0 ? (
                  <select
                    value={academicCycle}
                    onChange={(e) => setAcademicCycle(e.target.value)}
                    className="w-full h-10 px-3 bg-surface-container-lowest rounded-lg text-xs font-semibold text-on-surface border border-[#CBD5E1] focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none shadow-sm cursor-pointer"
                  >
                    {cycles.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} {c.status === 'active' ? '(Activo)' : c.status === 'upcoming' ? '(Próximo)' : '(Concluido)'}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="h-10 px-space-md bg-surface-container-low rounded-lg flex items-center justify-between text-on-surface text-sm border border-[#E2E8F0]">
                    <span className="font-semibold text-xs">{academicCycle}</span>
                    <span className="material-symbols-outlined text-outline text-base">event</span>
                  </div>
                )}
              </div>

              {/* Aula Física / Laboratorio */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">Aula / Laboratorio</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-outline text-lg pointer-events-none">meeting_room</span>
                  <input 
                    value={classroom}
                    onChange={(e) => setClassroom(e.target.value)}
                    className="w-full h-10 pl-9 pr-space-md bg-surface-container-lowest rounded-lg text-sm text-on-surface border border-[#CBD5E1] focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none shadow-sm" 
                    placeholder="Ej. Lab de Cómputo 3" 
                    type="text" 
                  />
                </div>
              </div>

              {/* Cupo Máximo */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">Cupo Máximo</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-outline text-lg pointer-events-none">group</span>
                  <input 
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full h-10 pl-9 pr-space-md bg-surface-container-lowest rounded-lg font-mono-numeric text-sm text-on-surface border border-[#CBD5E1] focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none shadow-sm" 
                    max={60} 
                    min={5} 
                    type="number" 
                  />
                </div>
              </div>
            </div>
          </section>

          {/* BLOQUE 2: Horarios de Clase y Sesiones Semanales */}
          <section id="etapa-2" className="bg-surface-container-lowest rounded-xl shadow-sm border border-[#E2E8F0] p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-space-sm border-b border-[#F1F5F9]">
              <div className="flex items-center gap-space-sm">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">schedule</span>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Etapa 2</span>
                  <h2 className="text-base text-on-surface font-semibold">Horarios de Clase y Sesiones Semanales</h2>
                </div>
              </div>
              <span className="px-space-sm py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-mono-numeric text-xs font-semibold">
                {activeSessions.length} {activeSessions.length === 1 ? 'Sesión Semanal' : 'Sesiones Semanales'}
              </span>
            </div>

            {/* Interactive Weekdays Selector */}
            <div className="flex flex-col gap-space-xs">
              <span className="text-xs font-semibold text-on-surface-variant">Días hábiles de impartición (clic para activar o desactivar):</span>
              <div className="grid grid-cols-5 gap-space-xs">
                {schedules.map((item) => (
                  <button
                    key={item.day}
                    type="button"
                    onClick={() => toggleDay(item.day)}
                    className={`py-space-sm rounded-lg flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      item.active
                        ? 'bg-primary-container text-on-primary shadow-sm hover:opacity-95'
                        : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    <span className="text-xs font-bold">{item.shortDay}</span>
                    <span className={`text-[11px] ${item.active ? 'text-on-primary-container font-mono-numeric' : 'text-outline'}`}>
                      {item.active ? `${item.startTime} - ${item.endTime}` : 'Sin sesión'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Detailed Time Rows */}
            <div className="flex flex-col gap-space-sm bg-surface-container-low/70 p-space-md rounded-xl border border-[#E2E8F0]">
              <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-semibold uppercase tracking-wider px-space-xs">
                <span className="w-24">Día</span>
                <span>Hora Inicio</span>
                <span>Hora Término</span>
                <span className="flex-1 text-center">Tipo de Sesión</span>
                <span>Acción</span>
              </div>

              {activeSessions.length === 0 ? (
                <div className="p-4 text-center text-xs text-on-surface-variant bg-white rounded-lg">
                  No hay días activos configurados. Haz clic en los botones de arriba para activar días de clase.
                </div>
              ) : (
                schedules.filter(s => s.active).map((item) => (
                  <div key={item.day} className="bg-surface-container-lowest p-2 rounded-lg flex items-center justify-between gap-space-sm shadow-sm border border-[#E2E8F0]">
                    <div className="w-24 pl-space-xs flex items-center gap-1.5 text-xs text-on-surface font-semibold">
                      <span className="w-2 h-2 rounded-full bg-secondary shrink-0"></span>
                      <span>{item.day}</span>
                    </div>

                    <input 
                      value={item.startTime}
                      onChange={(e) => updateSchedule(item.day, 'startTime', e.target.value)}
                      className="h-8 px-2 bg-surface-container-low rounded font-mono-numeric text-xs text-on-surface text-center focus:outline-none border border-[#CBD5E1]" 
                      type="time" 
                    />

                    <input 
                      value={item.endTime}
                      onChange={(e) => updateSchedule(item.day, 'endTime', e.target.value)}
                      className="h-8 px-2 bg-surface-container-low rounded font-mono-numeric text-xs text-on-surface text-center focus:outline-none border border-[#CBD5E1]" 
                      type="time" 
                    />

                    <select
                      value={item.sessionType}
                      onChange={(e) => updateSchedule(item.day, 'sessionType', e.target.value)}
                      className="px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface text-xs font-medium border border-transparent focus:outline-none cursor-pointer"
                    >
                      <option>Teoría (100 min)</option>
                      <option>Laboratorio (100 min)</option>
                      <option>Taller / Resolución (50 min)</option>
                      <option>Seminario Práctico (90 min)</option>
                      <option>Práctica de Campo (120 min)</option>
                    </select>

                    <button 
                      onClick={() => deleteSession(item.day)}
                      className="p-1.5 rounded text-outline hover:text-error hover:bg-error/10 transition-colors cursor-pointer" 
                      title="Eliminar sesión" 
                      type="button"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Tolerancia y Sincronización Calendario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-xs">
              <div className="flex items-center justify-between p-space-md bg-surface-container-low rounded-lg border border-[#E2E8F0]">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-secondary">sync</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-on-surface">Sincronizar calendario escolar</span>
                    <span className="text-[11px] text-on-surface-variant">Omite días festivos e inhábiles automáticamente</span>
                  </div>
                </div>
                <input 
                  checked={syncCalendar}
                  onChange={(e) => setSyncCalendar(e.target.checked)}
                  className="w-4 h-4 accent-secondary cursor-pointer" 
                  type="checkbox" 
                />
              </div>

              <div className="flex items-center justify-between p-space-md bg-surface-container-low rounded-lg border border-[#E2E8F0]">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-secondary">timer</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-on-surface">Tolerancia de retardo</span>
                    <span className="text-[11px] text-on-surface-variant">Minutos antes de marcar 'Falta' en Pase de Lista</span>
                  </div>
                </div>
                <select 
                  value={lateTolerance}
                  onChange={(e) => setLateTolerance(e.target.value)}
                  className="h-8 px-space-sm bg-surface-container-lowest rounded font-mono-numeric text-on-surface text-xs focus:outline-none shadow-sm cursor-pointer border border-[#CBD5E1]"
                >
                  <option>5 min</option>
                  <option>10 min</option>
                  <option>15 min</option>
                  <option>Sin tolerancia</option>
                </select>
              </div>
            </div>
          </section>

          {/* BLOQUE 3: Criterios de Evaluación y Calificaciones Predefinidos */}
          <section id="etapa-3" className="bg-surface-container-lowest rounded-xl shadow-sm border border-[#E2E8F0] p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-space-sm border-b border-[#F1F5F9]">
              <div className="flex items-center gap-space-sm">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">rule</span>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Etapa 3</span>
                  <h2 className="text-base text-on-surface font-semibold">Criterios de Evaluación y Calificaciones</h2>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 px-space-sm py-0.5 rounded-full font-mono-numeric text-xs font-bold ${
                totalWeight === 100 ? 'bg-surface-container text-on-surface' : 'bg-red-100 text-red-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${totalWeight === 100 ? 'bg-secondary' : 'bg-red-600'}`}></span>
                <span>Total: {totalWeight}% Ponderado</span>
              </div>
            </div>

            {/* Modalidad de Cortes Evaluativos (Trimestre, Parcial, Bimestre, Periodo) */}
            <div className="p-space-md bg-surface-container-low/70 rounded-xl border border-[#E2E8F0] flex flex-col gap-space-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-lg">calendar_view_week</span>
                  <div>
                    <h3 className="text-xs font-bold text-on-surface">Estructura Temporal de Evaluación</h3>
                    <p className="text-[11px] text-on-surface-variant">
                      Define los cortes del ciclo: Trimestres (Secundaria y ciclo anual), Parciales (Preparatoria / Universidad), Bimestres o Periodos.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-[11px] font-semibold text-on-surface-variant">Cortes:</span>
                  <select
                    value={numberOfPeriods}
                    onChange={(e) => setNumberOfPeriods(Number(e.target.value))}
                    className="h-8 px-2 bg-surface-container-lowest rounded-lg font-mono-numeric text-xs font-bold text-primary border border-[#CBD5E1] cursor-pointer"
                  >
                    <option value={2}>2 Cortes</option>
                    <option value={3}>3 Cortes (Estándar)</option>
                    <option value={4}>4 Cortes</option>
                    <option value={5}>5 Cortes (Bimestral)</option>
                    <option value={6}>6 Cortes</option>
                  </select>
                </div>
              </div>

              {/* Selector de opciones de cortes */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space-xs pt-1">
                {[
                  { id: 'trimestres', label: 'Por Trimestre', desc: 'Secundaria / Ciclo', icon: 'view_week' },
                  { id: 'parciales', label: 'Por Parciales', desc: 'Prepa / Universidad', icon: 'splitscreen' },
                  { id: 'bimestres', label: 'Por Bimestre', desc: '5 Cortes bimestrales', icon: 'calendar_month' },
                  { id: 'cuatrimestres', label: 'Por Cuatrimestre', desc: '3 Cuatrimestres', icon: 'view_quilt' },
                  { id: 'periodos', label: 'Por Periodo / Bloque', desc: 'Módulos Flexibles', icon: 'event_repeat' },
                  { id: 'ciclo_unico', label: 'Ciclo Continuo', desc: 'Sin cortes intermedios', icon: 'all_inclusive' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setEvaluationStructure(item.id as EvaluationStructure);
                      if (item.id === 'bimestres') setNumberOfPeriods(5);
                      else if (item.id === 'ciclo_unico') setNumberOfPeriods(1);
                      else setNumberOfPeriods(3);
                    }}
                    className={`p-2 rounded-lg flex flex-col items-center text-center transition-all cursor-pointer border ${
                      evaluationStructure === item.id
                        ? 'bg-primary-container text-on-primary border-primary-container shadow-xs'
                        : 'bg-surface-container-lowest text-on-surface border-[#E2E8F0] hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base mb-0.5">{item.icon}</span>
                    <span className="text-[11px] font-bold leading-tight">{item.label}</span>
                    <span className={`text-[9px] mt-0.5 leading-none ${evaluationStructure === item.id ? 'text-on-primary-container' : 'text-outline'}`}>
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de Plantilla Inicial */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
              <label 
                onClick={() => handleSelectPreset('aulagrade')}
                className={`cursor-pointer p-space-md rounded-xl transition-all flex flex-col gap-1 border ${
                  criteriaPreset === 'aulagrade' 
                    ? 'bg-surface-container-high border-primary shadow-sm' 
                    : 'bg-surface-container-low border-transparent hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">Plantilla AulaGrade</span>
                  <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                </div>
                <p className="text-[11px] text-on-surface-variant">Esquema balanceado estándar: Trabajos (35%), Exámenes (20%), etc.</p>
              </label>

              <label 
                onClick={() => handleSelectPreset('copy')}
                className={`cursor-pointer p-space-md rounded-xl transition-all flex flex-col gap-1 border ${
                  criteriaPreset === 'copy' 
                    ? 'bg-surface-container-high border-primary shadow-sm' 
                    : 'bg-surface-container-low border-transparent hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface">Copiar de Grupo</span>
                  <span className="material-symbols-outlined text-outline text-base">content_copy</span>
                </div>
                <p className="text-[11px] text-on-surface-variant">Hereda los pesos de 'Álgebra Lineal' o 'Química General'.</p>
              </label>

              <label 
                onClick={() => handleSelectPreset('scratch')}
                className={`cursor-pointer p-space-md rounded-xl transition-all flex flex-col gap-1 border ${
                  criteriaPreset === 'scratch' 
                    ? 'bg-surface-container-high border-primary shadow-sm' 
                    : 'bg-surface-container-low border-transparent hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface">Desde Cero</span>
                  <span className="material-symbols-outlined text-outline text-base">tune</span>
                </div>
                <p className="text-[11px] text-on-surface-variant">Crea competencias libres según requerimientos específicos.</p>
              </label>
            </div>

            {/* Barra Visual de Ponderación Dinámica */}
            <div className="flex flex-col gap-space-xs pt-space-xs">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-on-surface-variant">Distribución de Ponderación</span>
                <span className={`font-mono-numeric ${totalWeight === 100 ? 'text-secondary' : 'text-error font-bold'}`}>
                  {totalWeight}% Asignado {totalWeight !== 100 && '(Debe sumar 100%)'}
                </span>
              </div>
              <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden flex shadow-inner">
                <div className="bg-secondary h-full transition-all duration-300" style={{ width: `${weights.homework}%` }} title={`Tareas y Trabajos: ${weights.homework}%`}></div>
                <div className="bg-primary h-full transition-all duration-300" style={{ width: `${weights.exams}%` }} title={`Exámenes y Pruebas: ${weights.exams}%`}></div>
                <div className="bg-tertiary-container h-full transition-all duration-300" style={{ width: `${weights.attendance}%` }} title={`Asistencia y Puntualidad: ${weights.attendance}%`}></div>
                <div className="bg-secondary-container h-full transition-all duration-300" style={{ width: `${weights.participation}%` }} title={`Participación y Talleres: ${weights.participation}%`}></div>
                <div className="bg-primary-fixed-dim h-full transition-all duration-300" style={{ width: `${weights.selfEval}%` }} title={`Autoevaluación: ${weights.selfEval}%`}></div>
              </div>

              {/* Legend Badges with direct percentage adjusters */}
              <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
                <div className="flex items-center gap-1.5 text-xs text-on-surface bg-surface-container-low px-2 py-1 rounded">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                  <span className="font-medium">Trabajos</span>
                  <input 
                    type="number" 
                    value={weights.homework} 
                    onChange={(e) => setWeights({ ...weights, homework: Number(e.target.value) })}
                    className="w-12 h-6 bg-white border border-[#CBD5E1] rounded text-center font-mono-numeric text-xs font-semibold"
                  />
                  <span>%</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-on-surface bg-surface-container-low px-2 py-1 rounded">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                  <span className="font-medium">Exámenes</span>
                  <input 
                    type="number" 
                    value={weights.exams} 
                    onChange={(e) => setWeights({ ...weights, exams: Number(e.target.value) })}
                    className="w-12 h-6 bg-white border border-[#CBD5E1] rounded text-center font-mono-numeric text-xs font-semibold"
                  />
                  <span>%</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-on-surface bg-surface-container-low px-2 py-1 rounded">
                  <span className="w-2.5 h-2.5 rounded-full bg-tertiary-container"></span>
                  <span className="font-medium">Asistencia</span>
                  <input 
                    type="number" 
                    value={weights.attendance} 
                    onChange={(e) => setWeights({ ...weights, attendance: Number(e.target.value) })}
                    className="w-12 h-6 bg-white border border-[#CBD5E1] rounded text-center font-mono-numeric text-xs font-semibold"
                  />
                  <span>%</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-on-surface bg-surface-container-low px-2 py-1 rounded">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary-container"></span>
                  <span className="font-medium">Participación</span>
                  <input 
                    type="number" 
                    value={weights.participation} 
                    onChange={(e) => setWeights({ ...weights, participation: Number(e.target.value) })}
                    className="w-12 h-6 bg-white border border-[#CBD5E1] rounded text-center font-mono-numeric text-xs font-semibold"
                  />
                  <span>%</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-on-surface bg-surface-container-low px-2 py-1 rounded">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-fixed-dim"></span>
                  <span className="font-medium">Autoeval.</span>
                  <input 
                    type="number" 
                    value={weights.selfEval} 
                    onChange={(e) => setWeights({ ...weights, selfEval: Number(e.target.value) })}
                    className="w-12 h-6 bg-white border border-[#CBD5E1] rounded text-center font-mono-numeric text-xs font-semibold"
                  />
                  <span>%</span>
                </div>
              </div>
            </div>

            {/* Escala Numérica y Mínimo Aprobatorio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-sm">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">Escala de Calificación</label>
                <select 
                  value={gradeScale}
                  onChange={(e) => setGradeScale(e.target.value as any)}
                  className="w-full h-10 px-space-md bg-surface-container-low rounded-lg text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary border border-[#E2E8F0] cursor-pointer"
                >
                  <option value="decimal">Decimal Oficial (0.0 a 10.0)</option>
                  <option value="centesimal">Centesimal (0 a 100 puntos)</option>
                  <option value="letters">Letras (A, B, C, D, F)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">Mínimo Aprobatorio</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-secondary text-lg pointer-events-none">grade</span>
                  <input 
                    value={minPassingGrade}
                    onChange={(e) => setMinPassingGrade(Number(e.target.value))}
                    className="w-full h-10 pl-9 pr-space-md bg-surface-container-low rounded-lg font-mono-numeric text-xs text-on-surface font-semibold focus:outline-none focus:ring-1 focus:ring-secondary shadow-sm border border-[#E2E8F0]" 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    max="10" 
                  />
                </div>
              </div>
            </div>
          </section>

          {/* BLOQUE 4: Roster y Carga de Alumnos (Matriculación) */}
          <section id="etapa-4" className="bg-surface-container-lowest rounded-xl shadow-sm border border-[#E2E8F0] p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-space-sm border-b border-[#F1F5F9]">
              <div className="flex items-center gap-space-sm">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">group_add</span>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">Etapa 4</span>
                  <h2 className="text-base text-on-surface font-semibold">Roster y Carga de Alumnos (Matriculación)</h2>
                </div>
              </div>
              <div className="flex items-center gap-space-xs">
                <button 
                  onClick={downloadTemplate}
                  className="px-space-sm py-1 rounded bg-surface-container text-primary text-xs font-semibold hover:bg-surface-container-high transition-colors flex items-center gap-1 cursor-pointer" 
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  <span>Descargar Plantilla Excel</span>
                </button>
              </div>
            </div>

            {/* Enrollment Tabs */}
            <div className="flex border-b border-surface-container-high gap-space-md text-xs font-semibold">
              <button 
                onClick={() => setActiveEnrollTab('upload')}
                className={`pb-space-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                  activeEnrollTab === 'upload' ? 'text-primary border-b-2 border-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-base">upload_file</span>
                <span>Importar CSV / Excel</span>
              </button>

              <button 
                onClick={() => {
                  setActiveEnrollTab('sis');
                  setShowSisSyncModal(true);
                }}
                className={`pb-space-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                  activeEnrollTab === 'sis' ? 'text-primary border-b-2 border-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-base">cloud_sync</span>
                <span>Sincronizar SIS / Banner</span>
              </button>

              <button 
                onClick={() => {
                  setActiveEnrollTab('manual');
                  setShowAddStudentModal(true);
                }}
                className={`pb-space-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                  activeEnrollTab === 'manual' ? 'text-primary border-b-2 border-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-base">person_add</span>
                <span>Manual Rápido</span>
              </button>
            </div>

            {/* Drag & Drop Dropzone */}
            <label 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileUpload}
              className="p-space-lg bg-surface-container-low/60 rounded-xl flex flex-col items-center justify-center text-center gap-space-sm hover:bg-surface-container-low transition-colors cursor-pointer group border-2 border-dashed border-[#CBD5E1] hover:border-secondary"
            >
              <input 
                type="file" 
                accept=".csv, .xlsx, .xls" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
              <div className="w-12 h-12 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-2xl">cloud_upload</span>
              </div>
              <div className="flex flex-col">
                <p className="text-xs font-bold text-on-surface">Arrastra tu archivo .xlsx o .csv aquí</p>
                <p className="text-[11px] text-on-surface-variant">o haz clic para examinar desde tu equipo (hasta 150 registros)</p>
              </div>
              <span className="px-space-sm py-0.5 rounded-full bg-surface-container-lowest text-outline text-[10px] shadow-xs border border-[#E2E8F0]">
                Formato: Matrícula, Nombre Completo, Correo Institucional
              </span>
            </label>

            {/* Live Preview of Loaded Roster */}
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <span className="text-xs font-bold text-on-surface">Alumnos Listos para Inscripción</span>
                  <span className="px-space-xs py-0.5 rounded-full bg-primary-container text-on-primary font-mono-numeric text-xs font-semibold">
                    {students.length} precargados
                  </span>
                </div>
                <button 
                  onClick={() => setShowAddStudentModal(true)}
                  className="text-secondary text-xs font-semibold hover:underline flex items-center gap-0.5 cursor-pointer" 
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>Añadir fila</span>
                </button>
              </div>

              {/* Quick Table */}
              <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-xs border border-[#E2E8F0]">
                <div className="grid grid-cols-12 gap-space-xs bg-surface-container-high/60 px-space-md py-space-xs text-on-surface-variant text-[11px] font-semibold uppercase tracking-wider">
                  <div className="col-span-3">Matrícula</div>
                  <div className="col-span-5">Estudiante</div>
                  <div className="col-span-3">Correo Institucional</div>
                  <div className="col-span-1 text-right">Estado</div>
                </div>

                {students.map((student, idx) => (
                  <div 
                    key={student.id}
                    className={`grid grid-cols-12 gap-space-xs px-space-md py-2 items-center hover:bg-surface-container-low transition-colors ${
                      idx % 2 === 1 ? 'bg-surface-container-low/20' : ''
                    }`}
                  >
                    <div className="col-span-3 font-mono-numeric text-on-surface font-semibold text-xs">
                      {student.matricula}
                    </div>

                    <div className="col-span-5 flex items-center gap-space-sm min-w-0">
                      {student.avatarUrl ? (
                        <img 
                          className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-[#E2E8F0]" 
                          src={student.avatarUrl} 
                          alt={student.name}
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-mono-numeric text-[10px] font-bold shrink-0">
                          {student.initials || student.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs font-medium text-on-surface truncate">
                        {student.name}
                      </span>
                    </div>

                    <div className="col-span-3 text-[11px] text-on-surface-variant truncate">
                      {student.email}
                    </div>

                    <div className="col-span-1 flex items-center justify-end gap-1">
                      <span className="material-symbols-outlined text-secondary text-base" title="Listo">
                        check_circle
                      </span>
                      <button 
                        onClick={() => removeStudent(student.id)}
                        className="text-outline hover:text-error transition-colors p-0.5 cursor-pointer"
                        title="Eliminar de lista"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT: Live Group Preview & Validation Inspector (4 Cols Sticky) */}
        <aside className="xl:col-span-4 sticky top-20 flex flex-col gap-space-md">
          {/* Live Card Preview */}
          <div className="bg-surface-container-lowest rounded-xl shadow-md border border-[#E2E8F0] p-space-md flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-space-xs">
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                Vista Previa de Tarjeta
              </span>
              <span className="px-space-xs py-0.5 rounded bg-surface-container text-outline font-mono-numeric text-[10px] font-medium">
                Dashboard Live
              </span>
            </div>

            {/* Rendered Group Card Simulation */}
            <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-md shadow-sm border border-[#E2E8F0] relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none"></div>

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-2xl">science</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-on-surface-variant font-mono-numeric">
                      {subjectCode || 'COD-000'} • {semester}
                    </span>
                    <h3 className="text-sm text-on-surface font-bold leading-tight">
                      {subjectName || 'Nombre de Asignatura'}
                    </h3>
                  </div>
                </div>
                <span className="px-space-sm py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-semibold">
                  {section}
                </span>
              </div>

              {/* Metadata Badges */}
              <div className="grid grid-cols-2 gap-space-xs text-xs text-on-surface-variant">
                <div className="flex items-center gap-1.5 bg-surface-container-lowest p-space-xs rounded border border-[#E2E8F0]">
                  <span className="material-symbols-outlined text-secondary text-base">meeting_room</span>
                  <span className="truncate">{classroom || 'Sin Aula'}</span>
                </div>

                <div className="flex items-center gap-1.5 bg-surface-container-lowest p-space-xs rounded border border-[#E2E8F0]">
                  <span className="material-symbols-outlined text-secondary text-base">wb_sunny</span>
                  <span>Turno {shift}</span>
                </div>

                <div className="flex items-center gap-1.5 bg-surface-container-lowest p-space-xs rounded border border-[#E2E8F0]">
                  <span className="material-symbols-outlined text-secondary text-base">calendar_month</span>
                  <span>{activeDaysString || 'Sin días'}</span>
                </div>

                <div className="flex items-center gap-1.5 bg-surface-container-lowest p-space-xs rounded border border-[#E2E8F0]">
                  <span className="material-symbols-outlined text-secondary text-base">group</span>
                  <span>{students.length} / {capacity} Alumnos</span>
                </div>
              </div>

              {/* Mini Progress Bar to Capacity */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] text-on-surface-variant">
                  <span>Capacidad Asignada</span>
                  <span className="font-mono-numeric font-semibold">{capacityPercent}% ({students.length}/{capacity})</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-secondary rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Readiness Checklist Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-[#E2E8F0] p-space-md flex flex-col gap-space-md">
            <h4 className="text-xs text-on-surface font-bold flex items-center justify-between">
              <span>Lista de Verificación</span>
              <span className="font-mono-numeric text-xs text-secondary font-bold">
                {completedSteps} de 4 Completos
              </span>
            </h4>

            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between p-2 rounded bg-surface-container-low text-on-surface">
                <div className="flex items-center gap-1.5">
                  <span className={`material-symbols-outlined text-base ${isBasicInfoValid ? 'text-secondary' : 'text-outline'}`}>
                    {isBasicInfoValid ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span className="text-xs font-medium">Información Básica</span>
                </div>
                <span className="text-[11px] text-on-surface-variant font-mono-numeric">{subjectCode || 'Pendiente'}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-surface-container-low text-on-surface">
                <div className="flex items-center gap-1.5">
                  <span className={`material-symbols-outlined text-base ${isScheduleValid ? 'text-secondary' : 'text-outline'}`}>
                    {isScheduleValid ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span className="text-xs font-medium">Horarios de Clase</span>
                </div>
                <span className="text-[11px] text-on-surface-variant font-mono-numeric">
                  {activeSessions.length} {activeSessions.length === 1 ? 'sesión' : 'sesiones'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-surface-container-low text-on-surface">
                <div className="flex items-center gap-1.5">
                  <span className={`material-symbols-outlined text-base ${isCriteriaValid ? 'text-secondary' : 'text-error'}`}>
                    {isCriteriaValid ? 'check_circle' : 'error'}
                  </span>
                  <span className="text-xs font-medium">Criterios de Evaluación</span>
                </div>
                <span className={`text-[11px] font-mono-numeric ${isCriteriaValid ? 'text-on-surface-variant' : 'text-error font-bold'}`}>
                  {totalWeight}% Ok
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-surface-container-low text-on-surface">
                <div className="flex items-center gap-1.5">
                  <span className={`material-symbols-outlined text-base ${isRosterValid ? 'text-secondary' : 'text-outline'}`}>
                    {isRosterValid ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span className="text-xs font-medium">Roster de Alumnos</span>
                </div>
                <span className="text-[11px] text-on-surface-variant font-mono-numeric">
                  {students.length} {students.length === 1 ? 'alumno' : 'alumnos'}
                </span>
              </div>
            </div>

            {/* System Notice Banner */}
            <div className="p-space-sm rounded-lg bg-surface-container-high/60 flex items-start gap-space-xs text-on-surface border border-[#E2E8F0]">
              <span className="material-symbols-outlined text-secondary text-lg shrink-0 mt-0.5">auto_awesome</span>
              <p className="text-[11px] leading-relaxed text-on-surface-variant">
                Al activar el grupo se generarán automáticamente las matrices del <strong className="text-on-surface">Cuaderno de Notas</strong> y la lista de control de <strong className="text-on-surface">Pase de Asistencia</strong> para las {activeSessions.length} sesiones semanales configuradas.
              </p>
            </div>

            {/* Sticky Action Trigger */}
            <button 
              onClick={handleCreateGroup}
              className="w-full py-space-sm rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-space-xs shadow-md shadow-primary/20 hover:shadow-lg cursor-pointer" 
              type="button"
            >
              <span className="material-symbols-outlined text-lg">rocket_launch</span>
              <span>Crear y Activar Grupo</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Modal: Add Student Manually */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">person_add</span>
                <span>Añadir Estudiante al Roster</span>
              </h3>
              <button 
                onClick={() => setShowAddStudentModal(false)}
                className="text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="flex flex-col gap-3 pt-4">
              <div>
                <label className="text-xs font-semibold text-on-surface">Nombre Completo *</label>
                <input 
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Ej. Rodrigo Mendoza Solís"
                  className="w-full h-9 px-3 text-xs bg-surface-container-low rounded border border-[#CBD5E1] mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface">Matrícula o Código</label>
                <input 
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  placeholder="Ej. AG-2024-0499 (o se genera auto)"
                  className="w-full h-9 px-3 text-xs bg-surface-container-low rounded border border-[#CBD5E1] mt-1 font-mono-numeric"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface">Correo Institucional</label>
                <input 
                  type="email"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  placeholder="Ej. r.mendoza@aulagrade.edu"
                  className="w-full h-9 px-3 text-xs bg-surface-container-low rounded border border-[#CBD5E1] mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button 
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold bg-surface-container-high rounded text-on-surface"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-primary text-on-primary rounded hover:bg-primary-container"
                >
                  Agregar a Lista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: SIS / Banner Sync Simulation */}
      {showSisSyncModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">cloud_sync</span>
                <span>Conexión Institucional SIS / Banner</span>
              </h3>
              <button 
                onClick={() => setShowSisSyncModal(false)}
                className="text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="py-4 flex flex-col gap-3 text-xs text-on-surface-variant">
              <p>
                AulaGrade sincroniza las inscripciones oficiales directamente con la API universitaria de Servicios Escolares (Banner / Canvas / Blackboard).
              </p>
              <div className="bg-surface-container-low p-3 rounded-lg border border-[#E2E8F0] flex flex-col gap-2">
                <div className="flex justify-between items-center text-[11px] font-semibold text-on-surface">
                  <span>Conector Activo:</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">En línea (Campus Norte)</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-semibold text-on-surface">
                  <span>NRC / ID de Oferta Académica:</span>
                  <span className="font-mono-numeric">NRC-90412 ({subjectCode})</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-semibold text-on-surface">
                  <span>Alumnos matriculados en sistema:</span>
                  <span className="font-mono-numeric text-primary font-bold">12 registros encontrados</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                type="button"
                onClick={() => setShowSisSyncModal(false)}
                className="px-3 py-1.5 text-xs font-semibold bg-surface-container-high rounded text-on-surface"
              >
                Cerrar
              </button>
              <button 
                type="button"
                onClick={() => {
                  // Add 2 extra students
                  setStudents(INITIAL_STUDENTS);
                  setShowSisSyncModal(false);
                }}
                className="px-4 py-1.5 text-xs font-bold bg-primary text-on-primary rounded hover:bg-primary-container flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">sync</span>
                <span>Sincronizar e Importar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
