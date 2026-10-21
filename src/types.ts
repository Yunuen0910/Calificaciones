/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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

export interface GradingCriteria {
  preset: 'aulagrade' | 'copy' | 'scratch';
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
  name: string;
  category: 'homework' | 'exams' | 'attendance' | 'participation' | 'selfEval';
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
