/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Group, Student, AssignmentGrade } from '../types';

export const AULAGRADE_LOGO = "https://lh3.googleusercontent.com/aida-public/AB6AXuBrDJzot0Zq1QzBsl3LvbdrD1P09b6q7vCqucMfQ3jEC-GSeneZrgp8YuVo0Ydi5tcWF3kyBvLoehp83-YOPP8jeg4KLDoGnaClRyhVuYVmXkdsW3Qn4CtQRXEuRh3uoYsy1AJfn-OewCxxxAUf82YvzbySNbV9UgxcuTHcZeZaOQmkDPy8cCNJTiMXP3id_qe-eR5SxCkIXWRMsHMlek7cyMd9YLUY2-quAYlPdM8TQcL57zvAhPw9fQ";

export const PROF_AVATAR = "https://lh3.googleusercontent.com/aida-public/AB6AXuCA9XgciCHMAqtXZ1RNKG3bbZ91L1NHuLFe6O4y-U9wNHwon8rCRaUC2I3K8ZCW90e7uN02bnb0hhoz8au5kp09WzbW4vvgsP7IisEGNyvXPn2p3g3bTOrMtQdBQsrFKb5HsOoNptRS9Qr58HRkdxSCv0cSC50QJDFQG04wQXvsWbJ3JeZVcuGGZYVXkFZLSrja8KG4dIJNafb1DPoJT3MPLPXiq8I4ZRACmrodTskuLUf6oTeaQRKRFQ";

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-1',
    matricula: 'AG-2024-0418',
    name: 'Valeria Sofía Ramos Gómez',
    email: 'v.ramos@aulagrade.edu',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDe5802ximnAiWdMpEIIsCo1jzy8IEi9lK7vgCvyDK9pLWPjLa625EWrVY3pIS_T-YQdOnQJP0EOtk3G6PdwHDgKsGtCxjGw5XUq7LFUukb3hY1hkKBc_xRkFDPj8oeLJemDlAYDDWeSGKXuZwmjAhwB-n0twTJawYB1ZYFnegGVxatG9M-orz5OZdnlowfPxJw09GEar0voyMG_vugnUU8XODPnW1v9_eaHo_1CKioAYVPW8BCg_jmFw',
    status: 'ready'
  },
  {
    id: 'std-2',
    matricula: 'AG-2024-0422',
    name: 'Mateo Emmanuel Silva Cruz',
    email: 'm.silva@aulagrade.edu',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZI4VNf42Dwct5z9pmLc5yYW6Fssnavef4KYSnFD1fKDNg3EEj3mBYdzbEBEw41uGtE-8tqrVQLfTQF5KAoCJX3Uf1NM1leYW5WwpD7ARRMNtCsP5ECxlYSYCZjfV3vwVeQ9Sd8UEVLB5qbfUppdUWQJar6lCMilVgJsfqu1XSymOSGY1_MsUDzWDu-BCNkyDWqjHyw11T4tTkV8wLyyz1se2wenpGdcUejgZ9ZpwI67cq6a1favNgqA',
    status: 'ready'
  },
  {
    id: 'std-3',
    matricula: 'AG-2024-0435',
    name: 'Camila Alejandra Paredes',
    email: 'c.paredes@aulagrade.edu',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbWzILLvJvtAfxr5qAYy04wCrk_1i1AOZEPhjRRiQDHZGKU46NyYu_-d0JksDTtzSOPN5j2eGANEW0gVIrQ5ECS5QjTyKdEUDI2E7ng3y5vZJ_V5XW5ybO4P5la51ShkWcfQrXVZNRy0EZZJt6sPJqZr0u0-LAONSBVEBr894kpMbf8rZmwz9pYIZnyn4vioEqDAv5ovb-mbKnUYmRv6hN8pyvpiYuvwrA9vSEhIDAepK9AwF2x0cNcw',
    status: 'ready'
  },
  {
    id: 'std-4',
    matricula: 'AG-2024-0449',
    name: 'Diego Luna Valenzuela',
    email: 'd.luna@aulagrade.edu',
    initials: 'DL',
    status: 'ready'
  },
  {
    id: 'std-5',
    matricula: 'AG-2024-0455',
    name: 'Mariana Torres Navarro',
    email: 'm.torres@aulagrade.edu',
    initials: 'MT',
    status: 'ready'
  },
  {
    id: 'std-6',
    matricula: 'AG-2024-0461',
    name: 'Alejandro Morales Fuentes',
    email: 'a.morales@aulagrade.edu',
    initials: 'AM',
    status: 'ready'
  }
];

export const INITIAL_GROUPS: Group[] = [
  {
    id: 'grp-fis-302',
    name: 'Física Cuántica I',
    code: 'FIS-302',
    educationLevel: 'Licenciatura / Universidad',
    semester: '3er Semestre',
    section: 'Grupo A',
    shift: 'Matutino',
    academicCycle: 'Ciclo 2024-2025 • P2',
    classroom: 'Edificio B - Aula 204',
    capacity: 35,
    syncCalendar: true,
    lateTolerance: '10 min',
    schedule: [
      { day: 'Lunes', shortDay: 'LUN', active: true, startTime: '07:00', endTime: '08:40', sessionType: 'Teoría (100 min)' },
      { day: 'Martes', shortDay: 'MAR', active: false, startTime: '07:00', endTime: '08:40', sessionType: 'Sin sesión' },
      { day: 'Miércoles', shortDay: 'MIÉ', active: true, startTime: '07:00', endTime: '08:40', sessionType: 'Laboratorio (100 min)' },
      { day: 'Jueves', shortDay: 'JUE', active: false, startTime: '07:00', endTime: '08:40', sessionType: 'Sin sesión' },
      { day: 'Viernes', shortDay: 'VIE', active: true, startTime: '08:50', endTime: '09:40', sessionType: 'Taller / Resolución (50 min)' }
    ],
    criteria: {
      preset: 'aulagrade',
      evaluationStructure: 'parciales',
      numberOfPeriods: 3,
      weights: {
        homework: 35,
        exams: 20,
        attendance: 20,
        participation: 15,
        selfEval: 10
      },
      scale: 'decimal',
      minPassingGrade: 7.0
    },
    students: INITIAL_STUDENTS.slice(0, 4),
    createdAt: '2026-10-15T08:00:00Z'
  },
  {
    id: 'grp-mat-201',
    name: 'Álgebra Lineal Avanzada',
    code: 'MAT-201',
    educationLevel: 'Licenciatura / Universidad',
    semester: '2do Semestre',
    section: 'Grupo B',
    shift: 'Matutino',
    academicCycle: 'Ciclo 2024-2025 • P2',
    classroom: 'Edificio A - Aula 102',
    capacity: 40,
    syncCalendar: true,
    lateTolerance: '5 min',
    schedule: [
      { day: 'Martes', shortDay: 'MAR', active: true, startTime: '08:50', endTime: '10:30', sessionType: 'Teoría (100 min)' },
      { day: 'Jueves', shortDay: 'JUE', active: true, startTime: '08:50', endTime: '10:30', sessionType: 'Ejercicios Prácticos (100 min)' }
    ],
    criteria: {
      preset: 'aulagrade',
      evaluationStructure: 'parciales',
      numberOfPeriods: 3,
      weights: {
        homework: 30,
        exams: 40,
        attendance: 15,
        participation: 10,
        selfEval: 5
      },
      scale: 'decimal',
      minPassingGrade: 7.0
    },
    students: INITIAL_STUDENTS.slice(0, 5),
    createdAt: '2026-10-10T09:30:00Z'
  },
  {
    id: 'grp-qui-104',
    name: 'Química General y Estequiometría',
    code: 'QUI-104',
    educationLevel: 'Secundaria / Bachillerato',
    semester: '1° Año Escolar',
    section: 'Grupo A',
    shift: 'Vespertino',
    academicCycle: 'Ciclo 2024-2025 • P2',
    classroom: 'Laboratorio Central Lab-2',
    capacity: 30,
    syncCalendar: true,
    lateTolerance: '10 min',
    schedule: [
      { day: 'Lunes', shortDay: 'LUN', active: true, startTime: '16:00', endTime: '17:40', sessionType: 'Teoría (100 min)' },
      { day: 'Jueves', shortDay: 'JUE', active: true, startTime: '16:00', endTime: '18:30', sessionType: 'Laboratorio Experimental (150 min)' }
    ],
    criteria: {
      preset: 'aulagrade',
      evaluationStructure: 'trimestres',
      numberOfPeriods: 3,
      weights: {
        homework: 25,
        exams: 35,
        attendance: 20,
        participation: 10,
        selfEval: 10
      },
      scale: 'decimal',
      minPassingGrade: 7.0
    },
    students: INITIAL_STUDENTS.slice(1, 6),
    createdAt: '2026-10-08T14:00:00Z'
  }
];

export const INITIAL_ASSIGNMENTS: AssignmentGrade[] = [
  // Periodo 1 / 1er Trimestre
  { id: 'asg-1', name: 'T1: Ley de Planck', category: 'homework', periodIndex: 1, maxScore: 10 },
  { id: 'asg-2', name: 'T2: Efecto Fotoeléctrico', category: 'homework', periodIndex: 1, maxScore: 10 },
  { id: 'asg-3', name: 'Examen 1er Corte', category: 'exams', periodIndex: 1, maxScore: 10 },
  { id: 'asg-4', name: 'Asistencia P1', category: 'attendance', periodIndex: 1, maxScore: 10 },
  { id: 'asg-5', name: 'Participación P1', category: 'participation', periodIndex: 1, maxScore: 10 },
  { id: 'asg-6', name: 'Autoeval. P1', category: 'selfEval', periodIndex: 1, maxScore: 10 },

  // Periodo 2 / 2do Trimestre
  { id: 'asg-7', name: 'T3: Modelo de Bohr', category: 'homework', periodIndex: 2, maxScore: 10 },
  { id: 'asg-8', name: 'T4: Indeterminación', category: 'homework', periodIndex: 2, maxScore: 10 },
  { id: 'asg-9', name: 'Examen 2do Corte', category: 'exams', periodIndex: 2, maxScore: 10 },
  { id: 'asg-10', name: 'Asistencia P2', category: 'attendance', periodIndex: 2, maxScore: 10 },
  { id: 'asg-11', name: 'Participación P2', category: 'participation', periodIndex: 2, maxScore: 10 },
  { id: 'asg-12', name: 'Autoeval. P2', category: 'selfEval', periodIndex: 2, maxScore: 10 },

  // Periodo 3 / 3er Trimestre
  { id: 'asg-13', name: 'T5: Ec. Schrödinger', category: 'homework', periodIndex: 3, maxScore: 10 },
  { id: 'asg-14', name: 'Proyecto Laboratorio', category: 'homework', periodIndex: 3, maxScore: 10 },
  { id: 'asg-15', name: 'Examen Departamental', category: 'exams', periodIndex: 3, maxScore: 10 },
  { id: 'asg-16', name: 'Asistencia P3', category: 'attendance', periodIndex: 3, maxScore: 10 },
  { id: 'asg-17', name: 'Participación P3', category: 'participation', periodIndex: 3, maxScore: 10 },
  { id: 'asg-18', name: 'Autoeval. P3', category: 'selfEval', periodIndex: 3, maxScore: 10 },
];

export const INITIAL_STUDENT_SCORES: Record<string, Record<string, number>> = {
  'std-1': {
    'asg-1': 9.5, 'asg-2': 9.8, 'asg-3': 9.2, 'asg-4': 10.0, 'asg-5': 9.5, 'asg-6': 9.0,
    'asg-7': 9.0, 'asg-8': 9.5, 'asg-9': 9.0, 'asg-10': 9.8, 'asg-11': 9.0, 'asg-12': 9.5,
    'asg-13': 9.8, 'asg-14': 9.5, 'asg-15': 9.2, 'asg-16': 10.0, 'asg-17': 9.5, 'asg-18': 9.0,
  },
  'std-2': {
    'asg-1': 8.0, 'asg-2': 8.5, 'asg-3': 7.5, 'asg-4': 9.0, 'asg-5': 8.0, 'asg-6': 8.5,
    'asg-7': 8.2, 'asg-8': 8.0, 'asg-9': 7.0, 'asg-10': 8.5, 'asg-11': 8.0, 'asg-12': 8.0,
    'asg-13': 8.5, 'asg-14': 8.0, 'asg-15': 7.8, 'asg-16': 9.0, 'asg-17': 8.5, 'asg-18': 8.0,
  },
  'std-3': {
    'asg-1': 8.8, 'asg-2': 9.0, 'asg-3': 8.5, 'asg-4': 9.5, 'asg-5': 9.0, 'asg-6': 9.5,
    'asg-7': 9.0, 'asg-8': 8.8, 'asg-9': 8.2, 'asg-10': 9.0, 'asg-11': 8.5, 'asg-12': 9.0,
    'asg-13': 8.8, 'asg-14': 9.2, 'asg-15': 8.6, 'asg-16': 9.5, 'asg-17': 9.0, 'asg-18': 9.2,
  },
  'std-4': {
    'asg-1': 6.5, 'asg-2': 6.0, 'asg-3': 6.2, 'asg-4': 7.5, 'asg-5': 7.0, 'asg-6': 7.0,
    'asg-7': 6.0, 'asg-8': 6.5, 'asg-9': 5.8, 'asg-10': 7.0, 'asg-11': 6.5, 'asg-12': 6.5,
    'asg-13': 6.8, 'asg-14': 6.5, 'asg-15': 6.0, 'asg-16': 7.5, 'asg-17': 7.0, 'asg-18': 6.5,
  },
  'std-5': {
    'asg-1': 9.0, 'asg-2': 9.2, 'asg-3': 8.8, 'asg-4': 9.0, 'asg-5': 8.5, 'asg-6': 9.0,
    'asg-7': 8.8, 'asg-8': 9.0, 'asg-9': 8.5, 'asg-10': 9.0, 'asg-11': 9.0, 'asg-12': 8.5,
    'asg-13': 9.2, 'asg-14': 9.0, 'asg-15': 9.0, 'asg-16': 9.5, 'asg-17': 9.0, 'asg-18': 9.0,
  },
  'std-6': {
    'asg-1': 5.5, 'asg-2': 5.0, 'asg-3': 5.2, 'asg-4': 6.0, 'asg-5': 6.0, 'asg-6': 6.5,
    'asg-7': 5.8, 'asg-8': 5.5, 'asg-9': 5.0, 'asg-10': 6.0, 'asg-11': 5.5, 'asg-12': 6.0,
    'asg-13': 6.0, 'asg-14': 5.8, 'asg-15': 5.2, 'asg-16': 6.5, 'asg-17': 6.0, 'asg-18': 6.0,
  }
};
