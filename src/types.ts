/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'teacher';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
  assignedGroupIds?: string[];
  createdAt: string;
}

export interface AcademicCycle {
  id: string;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'closed' | 'upcoming';
  isDefault?: boolean;
  periodStructure: EvaluationStructure;
  periodsCount: number;
}

export interface Student {
  id: string;
  matricula: string;
  name: string;
  email: string;
  avatarUrl?: string;
  initials?: string;
  status: 'ready' | 'enrolled';
}

export type WeekDay = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';

export interface SessionSchedule {
  day: WeekDay;
  shortDay: 'LUN' | 'MAR' | 'MIÉ' | 'JUE' | 'VIE';
  active: boolean;
  startTime: string;
  endTime: string;
  sessionType: string;
}

export type EvaluationStructure = 'parciales' | 'trimestres' | 'bimestres' | 'cuatrimestres' | 'periodos' | 'ciclo_unico';

export interface GradingCriteria {
  preset: 'aulagrade' | 'copy' | 'scratch';
  evaluationStructure: EvaluationStructure;
  numberOfPeriods: number; // e.g. 3 trimestres, 3 parciales, 5 bimestres
  weights: {
    homework: number;     // Trabajos (35%)
    exams: number;        // Exámenes (20%)
    attendance: number;   // Asistencia (20%)
    participation: number;// Participación (15%)
    selfEval: number;     // Autoevaluación (10%)
  };
  scale: 'decimal' | 'centesimal' | 'letters';
  minPassingGrade: number;
}

export interface Group {
  id: string;
  name: string;
  code: string;
  educationLevel: string;
  semester: string;
  section: 'Grupo A' | 'Grupo B' | 'Grupo C';
  shift: 'Matutino' | 'Vespertino' | 'Mixto';
  academicCycle: string;
  cycleId?: string;
  teacherId?: string;
  teacherName?: string;
  classroom: string;
  capacity: number;
  syncCalendar: boolean;
  lateTolerance: string;
  schedule: SessionSchedule[];
  criteria: GradingCriteria;
  students: Student[];
  createdAt: string;
}

export interface AssignmentGrade {
  id: string;
  groupId?: string; // Group ID to which this assignment belongs
  name: string;
  category: 'homework' | 'exams' | 'attendance' | 'participation' | 'selfEval';
  periodIndex?: number; // 1, 2, 3...
  maxScore: number;
}

export interface StudentGrades {
  studentId: string;
  scores: Record<string, number>; // assignmentId -> score
}

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused';

export interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  timestamp?: string;
  notes?: string;
}

