/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { User, AcademicCycle, Group, EvaluationStructure, InstitutionInfo } from '../types';
import { AULAGRADE_LOGO } from '../data/mockData';

interface AdminPanelProps {
  users: User[];
  cycles: AcademicCycle[];
  groups: Group[];
  activeCycle: string;
  schools: InstitutionInfo[];
  activeSchoolId: string;
  onSelectActiveSchool: (schoolId: string) => void;
  onAddSchool: (school: InstitutionInfo) => void;
  onUpdateSchool: (school: InstitutionInfo) => void;
  onDeleteSchool: (schoolId: string) => void;
  onClearDemoStudents: () => void;
  onCleanSlate: () => void;
  onResetDemoData: () => void;
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onAddCycle: (cycle: AcademicCycle) => void;
  onUpdateCycle: (cycle: AcademicCycle) => void;
  onSelectActiveCycle: (cycleName: string) => void;
  onExportBackup: () => void;
  onImportBackup: (jsonData: string) => boolean;
  onResetDatabase: () => void;
  onUpdateGroupTeacher?: (groupId: string, teacherId: string | undefined) => void;
}

export type AdminTab = 'cycles' | 'teachers' | 'groups' | 'institution' | 'backup';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  users,
  cycles,
  groups,
  activeCycle,
  schools,
  activeSchoolId,
  onSelectActiveSchool,
  onAddSchool,
  onUpdateSchool,
  onDeleteSchool,
  onClearDemoStudents,
  onCleanSlate,
  onResetDemoData,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onAddCycle,
  onUpdateCycle,
  onSelectActiveCycle,
  onExportBackup,
  onImportBackup,
  onResetDatabase,
  onUpdateGroupTeacher,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('cycles');

  // Modals state
  const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);

  // New Cycle Form state
  const [cycleName, setCycleName] = useState('');
  const [cycleCode, setCycleCode] = useState('');
  const [cycleStartDate, setCycleStartDate] = useState('2025-08-15');
  const [cycleEndDate, setCycleEndDate] = useState('2025-12-19');
  const [cyclePeriods, setCyclePeriods] = useState(3);
  const [cycleStructure, setCycleStructure] = useState<EvaluationStructure>('parciales');
  const [cycleStatus, setCycleStatus] = useState<'active' | 'closed' | 'upcoming'>('upcoming');

  // New/Edit Teacher Form state
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [teacherDept, setTeacherDept] = useState('Ciencias Exactas');
  const [teacherAssignedGroups, setTeacherAssignedGroups] = useState<string[]>([]);
  const [teacherFormError, setTeacherFormError] = useState('');

  // Multi-school state
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(activeSchoolId);
  const selectedSchool = schools.find((s) => s.id === selectedSchoolId) || schools[0] || {
    id: 'school-1',
    name: 'AulaGrade Instituto Académico',
    shortName: 'AulaGrade',
    campus: 'Campus Norte',
    cctCode: '09DEX0142A',
    logoUrl: AULAGRADE_LOGO,
    address: 'Av. Universidad Tecnológica 1024, Edificio Central',
    phone: '+52 (55) 5840-2000',
    email: 'contacto@aulagrade.edu',
    directorName: 'Dra. Gabriela Solís Vega',
    directorTitle: 'Directora General y Servicios Escolares',
  };

  // New School Modal state
  const [isNewSchoolModalOpen, setIsNewSchoolModalOpen] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolShortName, setNewSchoolShortName] = useState('');
  const [newSchoolCampus, setNewSchoolCampus] = useState('');
  const [newSchoolCct, setNewSchoolCct] = useState('');
  const [newSchoolLogo, setNewSchoolLogo] = useState('');
  const [newSchoolAddress, setNewSchoolAddress] = useState('');
  const [newSchoolPhone, setNewSchoolPhone] = useState('');
  const [newSchoolEmail, setNewSchoolEmail] = useState('');
  const [newSchoolDirector, setNewSchoolDirector] = useState('');
  const [newSchoolDirectorTitle, setNewSchoolDirectorTitle] = useState('Director(a) General');

  // Edit Institutional Form state
  const [instName, setInstName] = useState(selectedSchool.name);
  const [instShortName, setInstShortName] = useState(selectedSchool.shortName);
  const [instCampus, setInstCampus] = useState(selectedSchool.campus);
  const [instCctCode, setInstCctCode] = useState(selectedSchool.cctCode);
  const [instLogoUrl, setInstLogoUrl] = useState(selectedSchool.logoUrl);
  const [instAddress, setInstAddress] = useState(selectedSchool.address);
  const [instPhone, setInstPhone] = useState(selectedSchool.phone);
  const [instEmail, setInstEmail] = useState(selectedSchool.email);
  const [instDirectorName, setInstDirectorName] = useState(selectedSchool.directorName);
  const [instDirectorTitle, setInstDirectorTitle] = useState(selectedSchool.directorTitle);
  const [instSavedToast, setInstSavedToast] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const newSchoolLogoFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedSchool) {
      setInstName(selectedSchool.name);
      setInstShortName(selectedSchool.shortName);
      setInstCampus(selectedSchool.campus);
      setInstCctCode(selectedSchool.cctCode);
      setInstLogoUrl(selectedSchool.logoUrl);
      setInstAddress(selectedSchool.address);
      setInstPhone(selectedSchool.phone);
      setInstEmail(selectedSchool.email);
      setInstDirectorName(selectedSchool.directorName);
      setInstDirectorTitle(selectedSchool.directorTitle);
    }
  }, [selectedSchool]);

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setInstLogoUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNewSchoolLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setNewSchoolLogo(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: InstitutionInfo = {
      ...selectedSchool,
      id: selectedSchool.id,
      name: instName.trim() || 'AulaGrade Instituto Académico',
      shortName: instShortName.trim() || 'AulaGrade',
      campus: instCampus.trim() || 'Campus Norte',
      cctCode: instCctCode.trim() || '09DEX0142A',
      logoUrl: instLogoUrl || AULAGRADE_LOGO,
      address: instAddress.trim(),
      phone: instPhone.trim(),
      email: instEmail.trim(),
      directorName: instDirectorName.trim(),
      directorTitle: instDirectorTitle.trim(),
    };
    onUpdateSchool(updated);
    setInstSavedToast(true);
    setTimeout(() => setInstSavedToast(false), 3000);
  };

  const handleCreateNewSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim()) return;

    const newSchool: InstitutionInfo = {
      id: `school-${Date.now()}`,
      name: newSchoolName.trim(),
      shortName: newSchoolShortName.trim() || newSchoolName.trim().slice(0, 12),
      campus: newSchoolCampus.trim() || 'Plantel Principal',
      cctCode: newSchoolCct.trim() || '09DEX0000X',
      logoUrl: newSchoolLogo || AULAGRADE_LOGO,
      address: newSchoolAddress.trim(),
      phone: newSchoolPhone.trim(),
      email: newSchoolEmail.trim(),
      directorName: newSchoolDirector.trim() || 'Director(a) General',
      directorTitle: newSchoolDirectorTitle.trim() || 'Director(a)',
    };

    onAddSchool(newSchool);
    setSelectedSchoolId(newSchool.id);
    setIsNewSchoolModalOpen(false);
    setNewSchoolName('');
    setNewSchoolShortName('');
    setNewSchoolCampus('');
    setNewSchoolCct('');
    setNewSchoolLogo('');
    setNewSchoolAddress('');
    setNewSchoolPhone('');
    setNewSchoolEmail('');
    setNewSchoolDirector('');
  };

  // Import file ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatusMessage, setImportStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Handlers for Cycles
  const handleCreateCycle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cycleName.trim()) return;

    const newCycle: AcademicCycle = {
      id: `cycle-${Date.now()}`,
      name: cycleName.trim(),
      code: cycleCode.trim() || cycleName.trim().replace(/\s+/g, '-').toUpperCase(),
      startDate: cycleStartDate,
      endDate: cycleEndDate,
      status: cycleStatus,
      periodStructure: cycleStructure,
      periodsCount: Number(cyclePeriods),
      isDefault: cycleStatus === 'active',
    };

    onAddCycle(newCycle);
    if (cycleStatus === 'active') {
      onSelectActiveCycle(newCycle.name);
    }

    // Reset
    setCycleName('');
    setCycleCode('');
    setIsCycleModalOpen(false);
  };

  const handleToggleCycleStatus = (cycle: AcademicCycle) => {
    const nextStatus = cycle.status === 'active' ? 'closed' : 'active';
    onUpdateCycle({
      ...cycle,
      status: nextStatus,
    });
    if (nextStatus === 'active') {
      onSelectActiveCycle(cycle.name);
    }
  };

  // Handlers for Teachers
  const openNewTeacherModal = () => {
    setEditingTeacher(null);
    setTeacherName('');
    setTeacherEmail('');
    setTeacherPassword('');
    setTeacherDept('Departamento de Ciencias Exactas');
    setTeacherAssignedGroups([]);
    setTeacherFormError('');
    setIsTeacherModalOpen(true);
  };

  const openEditTeacherModal = (user: User) => {
    setEditingTeacher(user);
    setTeacherName(user.name);
    setTeacherEmail(user.email);
    setTeacherPassword(user.password);
    setTeacherDept(user.department || '');
    setTeacherAssignedGroups(user.assignedGroupIds || []);
    setTeacherFormError('');
    setIsTeacherModalOpen(true);
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherFormError('');

    if (!teacherName.trim() || !teacherEmail.trim() || !teacherPassword.trim()) {
      setTeacherFormError('Todos los campos son obligatorios.');
      return;
    }

    const emailTaken = users.some(
      (u) =>
        u.email.toLowerCase() === teacherEmail.trim().toLowerCase() &&
        u.id !== editingTeacher?.id
    );

    if (emailTaken) {
      setTeacherFormError('Ya existe un usuario con este correo electrónico.');
      return;
    }

    if (editingTeacher) {
      // Update
      const updatedUser: User = {
        ...editingTeacher,
        name: teacherName.trim(),
        email: teacherEmail.trim().toLowerCase(),
        password: teacherPassword,
        department: teacherDept.trim(),
        assignedGroupIds: teacherAssignedGroups,
      };
      onUpdateUser(updatedUser);
    } else {
      // Create
      const newUser: User = {
        id: `usr-prof-${Date.now()}`,
        name: teacherName.trim(),
        email: teacherEmail.trim().toLowerCase(),
        password: teacherPassword,
        role: 'teacher',
        department: teacherDept.trim(),
        assignedGroupIds: teacherAssignedGroups,
        createdAt: new Date().toISOString(),
      };
      onAddUser(newUser);
    }

    setIsTeacherModalOpen(false);
  };

  const handleToggleGroupAssignment = (groupId: string) => {
    setTeacherAssignedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  // File import handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = onImportBackup(content);
      if (success) {
        setImportStatusMessage({
          text: '¡Respaldo importado y restaurado exitosamente!',
          type: 'success',
        });
      } else {
        setImportStatusMessage({
          text: 'Error al procesar el archivo de respaldo. Asegúrate de que sea un archivo JSON válido generado por AulaGrade.',
          type: 'error',
        });
      }
      setTimeout(() => setImportStatusMessage(null), 5000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const teachers = users.filter((u) => u.role === 'teacher');

  return (
    <main className="ml-64 pt-20 pb-16 px-6 lg:px-10 min-h-screen bg-[#F8FAFC]">
      {/* Header Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
              Panel de Administración
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Soporte y Control Institucional
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Gestión Académica de AulaGrade
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Configura los ciclos escolares, crea cuentas para profesores con acceso restringido a sus materias y respalda la base de datos de la institución.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsCycleModalOpen(true)}
            className="px-4 py-2 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">calendar_add_on</span>
            <span>Nuevo Ciclo Escolar</span>
          </button>
          <button
            onClick={openNewTeacherModal}
            className="px-4 py-2 bg-secondary hover:bg-secondary/95 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">person_add</span>
            <span>Nuevo Profesor</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('cycles')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
            activeTab === 'cycles'
              ? 'border-primary text-primary bg-white shadow-sm'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <span className="material-symbols-outlined text-base">date_range</span>
          <span>Ciclos Escolares ({cycles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('teachers')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
            activeTab === 'teachers'
              ? 'border-primary text-primary bg-white shadow-sm'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <span className="material-symbols-outlined text-base">group</span>
          <span>Cuentas de Profesores ({teachers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('groups')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
            activeTab === 'groups'
              ? 'border-primary text-primary bg-white shadow-sm'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <span className="material-symbols-outlined text-base">class</span>
          <span>Auditoría de Grupos ({groups.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('institution')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
            activeTab === 'institution'
              ? 'border-primary text-primary bg-white shadow-sm'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <span className="material-symbols-outlined text-base">account_balance</span>
          <span>Escuelas e Identidad ({schools.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
            activeTab === 'backup'
              ? 'border-primary text-primary bg-white shadow-sm'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <span className="material-symbols-outlined text-base">cloud_sync</span>
          <span>Respaldo y Mantenimiento</span>
        </button>
      </div>

      {/* TAB 1: CICLOS ESCOLARES */}
      {activeTab === 'cycles' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {cycles.map((cycle) => {
              const isSelectedActive = activeCycle === cycle.name;
              return (
                <div
                  key={cycle.id}
                  className={`bg-white rounded-2xl p-5 border transition-all shadow-sm relative flex flex-col justify-between ${
                    isSelectedActive
                      ? 'border-emerald-500 ring-2 ring-emerald-500/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          cycle.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : cycle.status === 'upcoming'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {cycle.status === 'active'
                          ? 'Ciclo Activo'
                          : cycle.status === 'upcoming'
                          ? 'Próximo'
                          : 'Cerrado / Concluido'}
                      </span>
                      {isSelectedActive && (
                        <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                          En Uso Actual
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {cycle.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-mono">
                      Código: {cycle.code}
                    </p>

                    <div className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Periodos:</span>
                        <span className="font-semibold text-slate-700">
                          {cycle.periodsCount} {cycle.periodStructure}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Inicio:</span>
                        <span className="font-semibold text-slate-700">{cycle.startDate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Fin:</span>
                        <span className="font-semibold text-slate-700">{cycle.endDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onSelectActiveCycle(cycle.name)}
                      disabled={isSelectedActive}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isSelectedActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer'
                      }`}
                    >
                      {isSelectedActive ? 'Ciclo Seleccionado' : 'Establecer Activo'}
                    </button>

                    <button
                      onClick={() => handleToggleCycleStatus(cycle)}
                      title={cycle.status === 'active' ? 'Cerrar periodo' : 'Activar periodo'}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-xs"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {cycle.status === 'active' ? 'lock' : 'lock_open'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-blue-50 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3 text-blue-900 text-xs">
            <span className="material-symbols-outlined text-blue-600 text-lg shrink-0 mt-0.5">
              info
            </span>
            <div className="space-y-1">
              <p className="font-bold">Efecto del Ciclo Escolar Activo</p>
              <p className="text-blue-800 leading-relaxed">
                El ciclo marcado como activo se sincroniza con el selector superior de los profesores. Al cambiar de ciclo escolar, las calificaciones, listas de asistencia y grupos se filtran para mostrar únicamente el historial correspondiente a dicho periodo escolar.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CUENTAS DE PROFESORES */}
      {activeTab === 'teachers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Profesores y Docentes Registrados
                </h3>
                <p className="text-xs text-slate-500">
                  Control de credenciales de acceso y asignación de materias
                </p>
              </div>
              <button
                onClick={openNewTeacherModal}
                className="px-3.5 py-1.5 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">person_add</span>
                <span>Crear Acceso de Profesor</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {teachers.map((teacher) => {
                const assignedGroups = groups.filter(
                  (g) =>
                    g.teacherId === teacher.id ||
                    teacher.assignedGroupIds?.includes(g.id)
                );

                return (
                  <div
                    key={teacher.id}
                    className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      {teacher.avatarUrl ? (
                        <img
                          src={teacher.avatarUrl}
                          alt={teacher.name}
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                          {teacher.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">
                            {teacher.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                            {teacher.department || 'Docente'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{teacher.email}</span>
                          <span>•</span>
                          <span className="font-mono text-[11px] text-slate-400">
                            Clave: ••••••••
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-800">
                          {assignedGroups.length} materias asignadas
                        </span>
                        <p className="text-[11px] text-slate-400">
                          {assignedGroups.map((g) => g.code).join(', ') || 'Sin grupos asignados'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditTeacherModal(teacher)}
                          className="p-2 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
                          title="Editar cuenta o cambiar contraseña"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `¿Estás seguro de dar de baja la cuenta de ${teacher.name}?`
                              )
                            ) {
                              onDeleteUser(teacher.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar cuenta"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDITORÍA GLOBAL DE GRUPOS */}
      {activeTab === 'groups' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Todas las Materias y Grupos en el Sistema
                </h3>
                <p className="text-xs text-slate-500">
                  Supervisión general de grupos, profesores asignados y alumnos matriculados
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
                Total: {groups.length} grupos
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Código / Materia</th>
                    <th className="px-5 py-3">Profesor Titular</th>
                    <th className="px-5 py-3">Ciclo Escolar</th>
                    <th className="px-5 py-3">Alumnos</th>
                    <th className="px-5 py-3">Aula / Turno</th>
                    <th className="px-5 py-3">Escala</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {groups.map((group) => {
                    const teacher = users.find((u) => u.id === group.teacherId);
                    return (
                      <tr key={group.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-slate-900 block">{group.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {group.code} • {group.section}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {onUpdateGroupTeacher ? (
                            <select
                              value={group.teacherId || ''}
                              onChange={(e) => onUpdateGroupTeacher(group.id, e.target.value || undefined)}
                              className="text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary cursor-pointer max-w-[210px]"
                            >
                              <option value="">(Sin profesor asignado)</option>
                              {users
                                .filter((u) => u.role === 'teacher')
                                .map((t) => (
                                  <option key={t.id} value={t.id}>
                                    {t.name}
                                  </option>
                                ))}
                            </select>
                          ) : (
                            <span className="font-medium text-slate-800">
                              {teacher ? teacher.name : group.teacherName || 'Sin asignar'}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium text-[11px]">
                            {group.academicCycle}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-semibold text-slate-900">
                            {group.students?.length || 0}
                          </span>{' '}
                          alumnos
                        </td>
                        <td className="px-5 py-3.5 text-slate-500">
                          {group.classroom} • {group.shift}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="capitalize">{group.criteria?.evaluationStructure}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RESPALDO Y SOPORTE */}
      {activeTab === 'backup' && (
        <div className="space-y-6 max-w-4xl">
          {importStatusMessage && (
            <div
              className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-medium ${
                importStatusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {importStatusMessage.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <span>{importStatusMessage.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-xl">download</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Exportar Respaldo Institucional
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Descarga un archivo JSON con toda la base de datos completa: usuarios, profesores, ciclos escolares, materias, alumnos matriculados, ponderaciones y calificaciones registradas.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={onExportBackup}
                  className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span className="material-symbols-outlined text-sm">save_alt</span>
                  <span>Descargar Copia de Seguridad (.json)</span>
                </button>
              </div>
            </div>

            {/* Import Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-xl">upload_file</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Restaurar Respaldo
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Carga un archivo de respaldo generado previamente en AulaGrade para sincronizar o restaurar la información en cualquier computadora o navegador con GitHub Pages.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <input
                  type="file"
                  accept=".json,application/json"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span className="material-symbols-outlined text-sm">folder_open</span>
                  <span>Seleccionar Archivo de Respaldo (.json)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Reset & Maintenance Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Herramientas de Mantenimiento y Modo Producción
            </h4>

            {/* Clear Demo Students Card */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-amber-600">group_remove</span>
                  Vaciar Matrícula de Alumnos Demo
                </h4>
                <p className="text-xs text-amber-700 mt-1 max-w-xl">
                  Mantiene los grupos y materias creadas pero vacía las listas de alumnos precargados y sus calificaciones registradas. Permite inscribir a tus propios alumnos reales sin datos ficticios.
                </p>
              </div>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      '¿Deseas vaciar la matrícula de alumnos demo? Los grupos y materias se mantendrán, pero las listas de alumnos y calificaciones se limpiarán para que registres tus propios alumnos.'
                    )
                  ) {
                    onClearDemoStudents();
                  }
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-sm cursor-pointer transition-all shrink-0"
              >
                Vaciar Alumnos Demo
              </button>
            </div>

            {/* Clean Slate Production Card */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-blue-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-blue-600">cleaning_services</span>
                  Iniciar Sistema en Blanco (Modo Producción)
                </h4>
                <p className="text-xs text-blue-700 mt-1 max-w-xl">
                  Elimina todos los grupos, materias, alumnos y calificaciones de ejemplo. Deja la plataforma completamente limpia y en blanco lista para iniciar las operaciones escolares de la institución. Conserva tus cuentas de usuario y ciclos escolares.
                </p>
              </div>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      '¿Estás seguro de poner el sistema en Modo Producción en blanco? Se eliminarán todas las materias y alumnos de prueba para que comiences desde cero.'
                    )
                  ) {
                    onCleanSlate();
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm cursor-pointer transition-all shrink-0"
              >
                Iniciar en Blanco
              </button>
            </div>

            {/* Reset to Demo Data Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-slate-600">restart_alt</span>
                  Restablecer Datos de Demostración
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xl">
                  Vuelve a cargar los grupos muestra de Física Cuántica, Álgebra y Química Orgánica con sus alumnos y calificaciones de ejemplo para demostraciones o capacitación de docentes.
                </p>
              </div>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      '¿Deseas recargar los datos de prueba y alumnos de demostración?'
                    )
                  ) {
                    onResetDemoData();
                  }
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm cursor-pointer transition-all shrink-0"
              >
                Cargar Datos Demo
              </button>
            </div>

            {/* Factory Reset Card */}
            <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-rose-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-rose-600">warning</span>
                  Restablecer Base de Datos de Fábrica
                </h4>
                <p className="text-xs text-rose-700 mt-1 max-w-xl">
                  Elimina los datos locales y restaura las cuentas predeterminadas de ejemplo y materias originales.
                </p>
              </div>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      '¿Estás seguro de restablecer todos los datos a los valores de fábrica? Se perderán las modificaciones no respaldadas.'
                    )
                  ) {
                    onResetDatabase();
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-sm cursor-pointer transition-all shrink-0"
              >
                Restablecer Fábrica
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: IDENTIDAD INSTITUCIONAL Y MULTI-ESCUELA */}
      {activeTab === 'institution' && (
        <div className="space-y-6">
          {/* Schools Selector / Multi-Plantel Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">domain</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Planteles y Escuelas Registradas ({schools.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Gestiona múltiples escuelas con logos, directores, CCT y membretes 100% independientes en el mismo sistema.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsNewSchoolModalOpen(true)}
                className="px-4 py-2 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-base">add_business</span>
                <span>+ Registrar Nueva Escuela</span>
              </button>
            </div>

            {/* School Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
              {schools.map((school) => {
                const isActive = activeSchoolId === school.id;
                const isEditing = selectedSchoolId === school.id;
                const schoolGroupCount = groups.filter((g) => (g.schoolId || 'school-1') === school.id).length;

                return (
                  <div
                    key={school.id}
                    className={`rounded-2xl p-4 border transition-all flex flex-col justify-between relative ${
                      isEditing
                        ? 'bg-blue-50/40 border-primary shadow-sm ring-1 ring-primary/30'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      {/* Status Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isActive && (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                              Escuela Activa
                            </span>
                          )}
                          {isEditing && (
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                              Editando membrete
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          {school.cctCode || 'S/N CCT'}
                        </span>
                      </div>

                      {/* Header with Logo */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-xs">
                          <img
                            src={school.logoUrl}
                            alt={school.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1" title={school.name}>
                            {school.name}
                          </h4>
                          <p className="text-xs text-primary font-medium flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-[13px]">location_on</span>
                            <span className="truncate">{school.campus}</span>
                          </p>
                        </div>
                      </div>

                      {/* School Details */}
                      <div className="text-[11px] text-slate-500 space-y-1 mb-4 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Director(a):</span>
                          <span className="font-semibold text-slate-700 truncate max-w-[170px]" title={school.directorName}>
                            {school.directorName || 'Sin asignar'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Grupos en plantel:</span>
                          <span className="font-semibold text-slate-700">
                            {schoolGroupCount} {schoolGroupCount === 1 ? 'grupo' : 'grupos'}
                          </span>
                        </div>
                        {school.address && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Dirección:</span>
                            <span className="truncate max-w-[170px] text-slate-600" title={school.address}>
                              {school.address}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-1">
                        <button
                          type="button"
                          onClick={() => setSelectedSchoolId(school.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                            isEditing
                              ? 'bg-primary text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                          <span>{isEditing ? 'Editando' : 'Editar'}</span>
                        </button>

                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => onSelectActiveSchool(school.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1 cursor-pointer transition-colors"
                            title="Cambiar a esta escuela como la activa en el sistema"
                          >
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            <span>Activar</span>
                          </button>
                        )}
                      </div>

                      {schools.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              window.confirm(
                                `¿Estás seguro de eliminar el plantel "${school.name}"? Los datos de este plantel se descartarán.`
                              )
                            ) {
                              onDeleteSchool(school.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar este plantel"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form to edit selected school */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">edit_document</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Membrete y Datos Oficiales de: {selectedSchool.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Modifica los datos del plantel seleccionado (<span className="font-semibold text-primary">{selectedSchool.campus}</span>). Se reflejarán de inmediato en boletas, listas y reportes.
                  </p>
                </div>
              </div>

              {instSavedToast && (
                <div className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>¡Datos del plantel actualizados correctamente!</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveInstitution} className="mt-6 space-y-6">
              {/* Logo Section */}
              <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Logotipo Oficial de la Institución
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Preview */}
                  <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 p-2 flex items-center justify-center shadow-inner shrink-0 relative group">
                    <img
                      src={instLogoUrl}
                      alt="Logo Institucional"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div className="flex-1 w-full space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        URL de la Imagen o Logo
                      </label>
                      <input
                        type="url"
                        placeholder="https://ejemplo.com/logo-escuela.png"
                        value={instLogoUrl}
                        onChange={(e) => setInstLogoUrl(e.target.value)}
                        className="w-full h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        ref={logoFileInputRef}
                        onChange={handleLogoFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => logoFileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">upload</span>
                        <span>Subir Imagen desde el Equipo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setInstLogoUrl(AULAGRADE_LOGO)}
                        className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                      >
                        Restablecer Logo AulaGrade
                      </button>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] text-slate-400 font-medium">Logos sugeridos:</span>
                      <button
                        type="button"
                        onClick={() => setInstLogoUrl('https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=200&q=80')}
                        className="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
                      >
                        Academia Moderna
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={() => setInstLogoUrl('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=200&q=80')}
                        className="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
                      >
                        Universidad
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={() => setInstLogoUrl('https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=200&q=80')}
                        className="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
                      >
                        Colegio Técnico
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* General School Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre Oficial de la Institución
                  </label>
                  <input
                    type="text"
                    required
                    value={instName}
                    onChange={(e) => setInstName(e.target.value)}
                    placeholder="ej. Instituto Tecnológico y Académico Nacional"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre Corto / Siglas
                  </label>
                  <input
                    type="text"
                    required
                    value={instShortName}
                    onChange={(e) => setInstShortName(e.target.value)}
                    placeholder="ej. AulaGrade / ITAN"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Campus / Plantel / Sede
                  </label>
                  <input
                    type="text"
                    required
                    value={instCampus}
                    onChange={(e) => setInstCampus(e.target.value)}
                    placeholder="ej. Campus Central / Plantel 01"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Clave de Centro de Trabajo (CCT / RVOE)
                  </label>
                  <input
                    type="text"
                    value={instCctCode}
                    onChange={(e) => setInstCctCode(e.target.value)}
                    placeholder="ej. 09DEX0142A"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dirección Institucional
                  </label>
                  <input
                    type="text"
                    value={instAddress}
                    onChange={(e) => setInstAddress(e.target.value)}
                    placeholder="ej. Av. Universidad 1200, Col. del Valle"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teléfono Oficial
                  </label>
                  <input
                    type="text"
                    value={instPhone}
                    onChange={(e) => setInstPhone(e.target.value)}
                    placeholder="ej. +52 (55) 5544-3322"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Correo Electrónico de Contacto
                  </label>
                  <input
                    type="email"
                    value={instEmail}
                    onChange={(e) => setInstEmail(e.target.value)}
                    placeholder="ej. contacto@escuela.edu"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre del Director(a) o Titular
                  </label>
                  <input
                    type="text"
                    value={instDirectorName}
                    onChange={(e) => setInstDirectorName(e.target.value)}
                    placeholder="ej. Dra. María Eugenia Morales"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cargo Oficial para Firmas y Boletas
                  </label>
                  <input
                    type="text"
                    value={instDirectorTitle}
                    onChange={(e) => setInstDirectorTitle(e.target.value)}
                    placeholder="ej. Directora General de Control Escolar"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  <span>Guardar Cambios Institucionales</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVO CICLO ESCOLAR */}
      {isCycleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">
                  calendar_add_on
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Registrar Nuevo Ciclo Escolar
                </h3>
              </div>
              <button
                onClick={() => setIsCycleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateCycle} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre del Ciclo Escolar
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Ciclo 2025-2026 • P1"
                  value={cycleName}
                  onChange={(e) => setCycleName(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Código Identificador
                </label>
                <input
                  type="text"
                  placeholder="ej. 2025-2026-P1"
                  value={cycleCode}
                  onChange={(e) => setCycleCode(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estructura
                  </label>
                  <select
                    value={cycleStructure}
                    onChange={(e: any) => setCycleStructure(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="parciales">Parciales</option>
                    <option value="trimestres">Trimestres</option>
                    <option value="cuatrimestres">Cuatrimestres</option>
                    <option value="bimestres">Bimestres</option>
                    <option value="periodos">Periodos</option>
                    <option value="ciclo_unico">Ciclo Único</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Número de Cortes
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={cyclePeriods}
                    onChange={(e) => setCyclePeriods(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    required
                    value={cycleStartDate}
                    onChange={(e) => setCycleStartDate(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha de Fin
                  </label>
                  <input
                    type="date"
                    required
                    value={cycleEndDate}
                    onChange={(e) => setCycleEndDate(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estado Inicial
                </label>
                <select
                  value={cycleStatus}
                  onChange={(e: any) => setCycleStatus(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="active">Activo (Hacer activo inmediatamente)</option>
                  <option value="upcoming">Próximo</option>
                  <option value="closed">Cerrado / Concluido</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCycleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-semibold rounded-xl shadow-sm"
                >
                  Crear Ciclo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVO / EDITAR PROFESOR */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-xl">
                  {editingTeacher ? 'manage_accounts' : 'person_add'}
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  {editingTeacher ? 'Modificar Cuenta Docente' : 'Crear Acceso para Docente'}
                </h3>
              </div>
              <button
                onClick={() => setIsTeacherModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {teacherFormError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                  {teacherFormError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre Completo del Profesor
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Prof. Fernando Morales Díaz"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Correo Institucional (Usuario de acceso)
                </label>
                <input
                  type="email"
                  required
                  placeholder="ej. f.morales@aulagrade.edu"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contraseña de Acceso
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="••••••••"
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Departamento Académico
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Ciencias Exactas"
                    value={teacherDept}
                    onChange={(e) => setTeacherDept(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Materias / Grupos Asignados:
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Selecciona los grupos que este profesor podrá visualizar y calificar en su cuaderno de notas:
                </p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50">
                  {groups.map((group) => {
                    const isChecked = teacherAssignedGroups.includes(group.id);
                    return (
                      <label
                        key={group.id}
                        className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-slate-200/80 hover:border-slate-300 text-xs cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleGroupAssignment(group.id)}
                          className="rounded text-primary focus:ring-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-slate-800 block truncate">
                            {group.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {group.code} • {group.academicCycle}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTeacherModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-secondary hover:bg-secondary/95 text-white text-xs font-semibold rounded-xl shadow-sm"
                >
                  {editingTeacher ? 'Guardar Cambios' : 'Registrar Profesor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: REGISTRAR NUEVA ESCUELA / PLANTEL */}
      {isNewSchoolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">
                  add_business
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Registrar Nueva Escuela o Plantel
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Crea una institución independiente con su propio logo, CCT y directores
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewSchoolModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateNewSchool} className="p-5 space-y-4">
              {/* Logo Preview and Upload */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0">
                  <img
                    src={newSchoolLogo || AULAGRADE_LOGO}
                    alt="Logo"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-700">
                    Logotipo del Plantel
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      ref={newSchoolLogoFileInputRef}
                      onChange={handleNewSchoolLogoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => newSchoolLogoFileInputRef.current?.click()}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-semibold rounded-lg cursor-pointer"
                    >
                      Subir Imagen
                    </button>
                    <input
                      type="url"
                      placeholder="o pega URL de imagen"
                      value={newSchoolLogo}
                      onChange={(e) => setNewSchoolLogo(e.target.value)}
                      className="flex-1 h-7 px-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre Oficial de la Escuela *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Instituto de Bachillerato Tecnológico Siglo XXI"
                    value={newSchoolName}
                    onChange={(e) => setNewSchoolName(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre Corto / Siglas *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. IBAT / Colegio Siglo XXI"
                    value={newSchoolShortName}
                    onChange={(e) => setNewSchoolShortName(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Campus / Sede / Plantel *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Plantel Sur / Sede Centro"
                    value={newSchoolCampus}
                    onChange={(e) => setNewSchoolCampus(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Clave CCT / Registro SEP
                  </label>
                  <input
                    type="text"
                    placeholder="ej. 09DEX0999Z"
                    value={newSchoolCct}
                    onChange={(e) => setNewSchoolCct(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Director(a) o Titular
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Mtro. Juan Pablo Ruiz"
                    value={newSchoolDirector}
                    onChange={(e) => setNewSchoolDirector(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dirección del Plantel
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Av. Insurgentes Sur 450, Col. Roma"
                    value={newSchoolAddress}
                    onChange={(e) => setNewSchoolAddress(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    placeholder="ej. +52 55 1234 5678"
                    value={newSchoolPhone}
                    onChange={(e) => setNewSchoolPhone(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="ej. direccion@sigloxxi.edu"
                    value={newSchoolEmail}
                    onChange={(e) => setNewSchoolEmail(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewSchoolModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">check</span>
                  <span>Crear Escuela</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
