/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, AcademicCycle, InstitutionInfo } from '../types';
import { AULAGRADE_LOGO } from '../data/mockData';

export type NavTab =
  | 'dashboard'
  | 'alta-grupo'
  | 'cuaderno'
  | 'calificaciones-finales'
  | 'asistencia'
  | 'criterios'
  | 'admin-panel';

interface SidebarProps {
  currentUser: User | null;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeCycle: string;
  cycles: AcademicCycle[];
  onSelectCycle: (cycle: string) => void;
  onLogout: () => void;
  institutionInfo?: InstitutionInfo;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  activeCycle,
  cycles,
  onSelectCycle,
  onLogout,
  institutionInfo,
}) => {
  const [showCycleMenu, setShowCycleMenu] = React.useState(false);
  const [selectedCampus, setSelectedCampus] = React.useState(
    institutionInfo?.campus || 'Campus Norte'
  );
  const [showCampusMenu, setShowCampusMenu] = React.useState(false);

  React.useEffect(() => {
    if (institutionInfo?.campus) {
      setSelectedCampus(institutionInfo.campus);
    }
  }, [institutionInfo?.campus]);

  const campuses = [
    institutionInfo?.campus || 'Campus Norte',
    'Campus Sur',
    'Campus Virtual'
  ].filter((v, i, a) => a.indexOf(v) === i);

  const isAdmin = currentUser?.role === 'admin';

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between border-r border-[#E2E8F0]">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-16 px-space-md flex items-center justify-between bg-surface-container-lowest border-b border-[#E2E8F0]">
          <button 
            onClick={() => onSelectTab(isAdmin ? 'admin-panel' : 'dashboard')}
            className="flex items-center gap-space-sm text-left group focus:outline-none cursor-pointer overflow-hidden"
          >
            <img 
              alt={institutionInfo?.name || "AulaGrade Logo"} 
              className="h-8 max-w-[42px] object-contain transition-transform group-hover:scale-105 shrink-0 rounded" 
              src={institutionInfo?.logoUrl || AULAGRADE_LOGO} 
            />
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-base text-primary tracking-tight leading-tight truncate">
                {institutionInfo?.shortName || 'AulaGrade'}
              </span>
              {isAdmin ? (
                <span className="text-[10px] text-amber-700 font-bold tracking-wider uppercase">
                  Admin
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 font-medium truncate">
                  {institutionInfo?.campus || 'Portal Docente'}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Academic Period Selector */}
        <div className="px-space-md py-space-sm relative">
          <div 
            onClick={() => setShowCycleMenu(!showCycleMenu)}
            className="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-space-xs cursor-pointer hover:bg-surface-container transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                Ciclo Escolar
              </span>
              <span className="material-symbols-outlined text-secondary text-xs">
                verified
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-on-surface font-semibold truncate">
                {activeCycle}
              </span>
              <span className="material-symbols-outlined text-on-surface-variant text-base">
                {showCycleMenu ? 'arrow_drop_up' : 'arrow_drop_down'}
              </span>
            </div>
          </div>

          {showCycleMenu && (
            <div className="absolute top-full left-space-md right-space-md mt-1 bg-surface-container-lowest rounded-xl shadow-xl border border-[#E2E8F0] py-1 z-50">
              <div className="px-3 py-1 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Seleccionar Periodo
              </div>
              {cycles.map((cycle) => (
                <button
                  key={cycle.id}
                  onClick={() => {
                    onSelectCycle(cycle.name);
                    setShowCycleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-surface-container-low transition-colors flex items-center justify-between cursor-pointer ${
                    activeCycle === cycle.name ? 'text-primary font-bold bg-surface-container-low' : 'text-on-surface'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="truncate">{cycle.name}</p>
                    <span className="text-[10px] text-slate-400 block font-normal">
                      {cycle.status === 'active' ? '● Activo' : cycle.status === 'upcoming' ? '○ Próximo' : 'Cerrado'}
                    </span>
                  </div>
                  {activeCycle === cycle.name && (
                    <span className="material-symbols-outlined text-secondary text-sm shrink-0">check</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Items based on Role */}
        <nav className="flex flex-col gap-space-xs px-space-md mt-space-sm">
          {isAdmin ? (
            /* ADMIN NAVIGATION */
            <>
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Administración Global
              </div>

              <button
                onClick={() => onSelectTab('admin-panel')}
                className={`flex items-center gap-space-md px-space-md py-space-sm rounded-lg transition-colors text-sm cursor-pointer ${
                  activeTab === 'admin-panel'
                    ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium'
                }`}
              >
                <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                <span>Panel de Control</span>
              </button>

              <div className="my-2 border-t border-slate-100"></div>

              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Vistas de Supervisión
              </div>

              <button
                onClick={() => onSelectTab('dashboard')}
                className={`flex items-center gap-space-md px-space-md py-space-sm rounded-lg transition-colors text-sm cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium'
                }`}
              >
                <span className="material-symbols-outlined text-lg">dashboard</span>
                <span>Dashboard Docente</span>
              </button>

              <button
                onClick={() => onSelectTab('calificaciones-finales')}
                className={`flex items-center gap-space-md px-space-md py-space-sm rounded-lg transition-colors text-sm cursor-pointer ${
                  activeTab === 'calificaciones-finales'
                    ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium'
                }`}
              >
                <span className="material-symbols-outlined text-lg">workspace_premium</span>
                <span>Calificaciones Finales</span>
              </button>

              <button
                onClick={() => onSelectTab('cuaderno')}
                className={`flex items-center gap-space-md px-space-md py-space-sm rounded-lg transition-colors text-sm cursor-pointer ${
                  activeTab === 'cuaderno'
                    ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium'
                }`}
              >
                <span className="material-symbols-outlined text-lg">edit_note</span>
                <span>Cuaderno de Notas</span>
              </button>

              <button
                onClick={() => onSelectTab('asistencia')}
                className={`flex items-center gap-space-md px-space-md py-space-sm rounded-lg transition-colors text-sm cursor-pointer ${
                  activeTab === 'asistencia'
                    ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium'
                }`}
              >
                <span className="material-symbols-outlined text-lg">how_to_reg</span>
                <span>Pase de Lista</span>
              </button>
            </>
          ) : (
            /* TEACHER NAVIGATION */
            <>
              {/* 1. Dashboard de Grupos */}
              <button
                onClick={() => onSelectTab('dashboard')}
                className={`flex items-center gap-space-md px-space-md py-space-sm rounded-lg transition-colors text-sm cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium'
                }`}
              >
                <span className="material-symbols-outlined text-lg">dashboard</span>
                <span>Dashboard</span>
              </button>

              {/* 2. Alta Nuevo Grupo */}
              <button
                onClick={() => onSelectTab('alta-grupo')}
                className={`flex items-center gap-space-md px-space-md py-space-sm rounded-lg transition-colors text-sm cursor-pointer ${
                  activeTab === 'alta-grupo'
                    ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium'
                }`}
              >
                <span className="material-symbols-outlined text-lg">group_add</span>
                <span>Alta Nuevo Grupo</span>
              </button>

              {/* 3. Criterios de Evaluación */}
              <button
                onClick={() => onSelectTab('criterios')}
                className={`flex items-center gap-space-md px-space-md py-space-sm rounded-lg transition-colors text-sm cursor-pointer ${
                  activeTab === 'criterios'
                    ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium'
                }`}
              >
                <span className="material-symbols-outlined text-lg">tune</span>
                <span>Criterios de Evaluación</span>
              </button>

              {/* 4. Calificaciones Finales */}
              <button
                onClick={() => onSelectTab('calificaciones-finales')}
                className={`flex items-center gap-space-md px-space-md py-space-sm rounded-lg transition-colors text-sm cursor-pointer ${
                  activeTab === 'calificaciones-finales'
                    ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium'
                }`}
              >
                <span className="material-symbols-outlined text-lg">workspace_premium</span>
                <span>Calificaciones Finales</span>
              </button>

              {/* 5. Cuaderno de Notas */}
              <button
                onClick={() => onSelectTab('cuaderno')}
                className={`flex items-center gap-space-md px-space-md py-space-sm rounded-lg transition-colors text-sm cursor-pointer ${
                  activeTab === 'cuaderno'
                    ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium'
                }`}
              >
                <span className="material-symbols-outlined text-lg">edit_note</span>
                <span>Cuaderno de Notas</span>
              </button>

              {/* 6. Pase de Lista */}
              <button
                onClick={() => onSelectTab('asistencia')}
                className={`flex items-center gap-space-md px-space-md py-space-sm rounded-lg transition-colors text-sm cursor-pointer ${
                  activeTab === 'asistencia'
                    ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium'
                }`}
              >
                <span className="material-symbols-outlined text-lg">how_to_reg</span>
                <span>Pase de Lista</span>
              </button>
            </>
          )}
        </nav>
      </div>

      {/* User profile & Sede Central Footer */}
      <div className="p-space-md bg-surface-container-lowest border-t border-[#E2E8F0] space-y-2">
        {/* User bar */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-2 min-w-0">
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">
                {currentUser?.name}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {isAdmin ? 'Admin' : 'Docente'}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Cerrar sesión"
            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">logout</span>
          </button>
        </div>

        {/* Sede */}
        <div className="relative">
          <div 
            onClick={() => setShowCampusMenu(!showCampusMenu)}
            className="bg-surface-container-low rounded-lg p-space-sm flex items-center justify-between cursor-pointer hover:bg-surface-container transition-colors"
          >
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-secondary text-base">school</span>
              <div className="flex flex-col">
                <span className="text-[11px] text-on-surface-variant">Sede Institucional</span>
                <span className="text-[12px] text-on-surface font-semibold">{selectedCampus}</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-secondary text-sm">verified</span>
          </div>

          {showCampusMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-surface-container-lowest rounded-lg shadow-lg border border-[#E2E8F0] py-1 z-50">
              {campuses.map((camp) => (
                <button
                  key={camp}
                  onClick={() => {
                    setSelectedCampus(camp);
                    setShowCampusMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-surface-container-low transition-colors flex items-center justify-between cursor-pointer ${
                    selectedCampus === camp ? 'text-primary font-bold bg-surface-container-low' : 'text-on-surface'
                  }`}
                >
                  <span>{camp}</span>
                  {selectedCampus === camp && (
                    <span className="material-symbols-outlined text-secondary text-sm">check</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
