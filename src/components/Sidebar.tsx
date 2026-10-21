/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AULAGRADE_LOGO } from '../data/mockData';

export type NavTab = 'dashboard' | 'alta-grupo' | 'cuaderno' | 'asistencia' | 'criterios';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeCycle: string;
  onSelectCycle: (cycle: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  activeCycle,
  onSelectCycle,
}) => {
  const [showCycleMenu, setShowCycleMenu] = React.useState(false);
  const [selectedCampus, setSelectedCampus] = React.useState('Campus Norte');
  const [showCampusMenu, setShowCampusMenu] = React.useState(false);

  const cycles = [
    'Ciclo 2024-2025 • P2',
    'Ciclo 2024-2025 • P1',
    'Ciclo 2023-2024 • P2',
  ];

  const campuses = [
    'Campus Norte',
    'Campus Sur',
    'Campus Virtual'
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between border-r border-[#E2E8F0]">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-16 px-space-md flex items-center justify-between bg-surface-container-lowest border-b border-[#E2E8F0]">
          <button 
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-space-sm text-left group focus:outline-none"
          >
            <img 
              alt="AulaGrade Logo" 
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105" 
              src={AULAGRADE_LOGO} 
            />
            <span className="font-bold text-lg text-primary tracking-tight">AulaGrade</span>
          </button>
        </div>

        {/* Academic Period Selector */}
        <div className="px-space-md py-space-sm relative">
          <div 
            onClick={() => setShowCycleMenu(!showCycleMenu)}
            className="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-space-xs cursor-pointer hover:bg-surface-container transition-colors"
          >
            <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Periodo Activo
            </span>
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
            <div className="absolute top-full left-space-md right-space-md mt-1 bg-surface-container-lowest rounded-lg shadow-lg border border-[#E2E8F0] py-1 z-50">
              {cycles.map((cycle) => (
                <button
                  key={cycle}
                  onClick={() => {
                    onSelectCycle(cycle);
                    setShowCycleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-surface-container-low transition-colors flex items-center justify-between ${
                    activeCycle === cycle ? 'text-primary font-bold bg-surface-container-low' : 'text-on-surface'
                  }`}
                >
                  <span>{cycle}</span>
                  {activeCycle === cycle && (
                    <span className="material-symbols-outlined text-secondary text-sm">check</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-space-xs px-space-md mt-space-sm">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex items-center gap-space-md px-space-md py-space-sm rounded-lg transition-colors text-sm ${
              activeTab === 'dashboard'
                ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium'
            }`}
          >
            <span className="material-symbols-outlined text-lg">dashboard</span>
            <span>Dashboard de Grupos</span>
          </button>

          <button
            onClick={() => onSelectTab('alta-grupo')}
            className={`flex items-center gap-space-md px-space-md py-space-sm rounded-lg transition-colors text-sm ${
              activeTab === 'alta-grupo'
                ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium'
            }`}
          >
            <span className="material-symbols-outlined text-lg">add_box</span>
            <span>Alta de Nuevo Grupo</span>
          </button>

          <button
            onClick={() => onSelectTab('cuaderno')}
            className={`flex items-center gap-space-md px-space-md py-space-sm rounded-lg transition-colors text-sm ${
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
            className={`flex items-center gap-space-md px-space-md py-space-sm rounded-lg transition-colors text-sm ${
              activeTab === 'asistencia'
                ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium'
            }`}
          >
            <span className="material-symbols-outlined text-lg">how_to_reg</span>
            <span>Pase de Lista</span>
          </button>

          <button
            onClick={() => onSelectTab('criterios')}
            className={`flex items-center gap-space-md px-space-md py-space-sm rounded-lg transition-colors text-sm ${
              activeTab === 'criterios'
                ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium'
            }`}
          >
            <span className="material-symbols-outlined text-lg">rule</span>
            <span>Criterios de Evaluación</span>
          </button>
        </nav>
      </div>

      {/* Sede Central Footer */}
      <div className="p-space-md bg-surface-container-lowest border-t border-[#E2E8F0] relative">
        <div 
          onClick={() => setShowCampusMenu(!showCampusMenu)}
          className="bg-surface-container-low rounded-lg p-space-sm flex items-center justify-between cursor-pointer hover:bg-surface-container transition-colors"
        >
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-secondary text-base">school</span>
            <div className="flex flex-col">
              <span className="text-[11px] text-on-surface-variant">Sede Central</span>
              <span className="text-[13px] text-on-surface font-semibold">{selectedCampus}</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-secondary text-base">verified</span>
        </div>

        {showCampusMenu && (
          <div className="absolute bottom-full left-space-md right-space-md mb-1 bg-surface-container-lowest rounded-lg shadow-lg border border-[#E2E8F0] py-1 z-50">
            {campuses.map((camp) => (
              <button
                key={camp}
                onClick={() => {
                  setSelectedCampus(camp);
                  setShowCampusMenu(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-surface-container-low transition-colors flex items-center justify-between ${
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
    </aside>
  );
};
