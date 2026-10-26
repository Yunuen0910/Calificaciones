/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, AcademicCycle, InstitutionInfo } from '../types';
import { PROF_AVATAR } from '../data/mockData';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  activeCycle: string;
  cycles: AcademicCycle[];
  onSelectCycle: (cycle: string) => void;
  onOpenSearch: () => void;
  onOpenHelp: () => void;
  unreadNotificationsCount?: number;
  institutionInfo?: InstitutionInfo;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  activeCycle,
  cycles,
  onSelectCycle,
  onOpenSearch,
  onOpenHelp,
  unreadNotificationsCount = 2,
  institutionInfo,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCycleDropdown, setShowCycleDropdown] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'Entrega de Tarea 2 Recibida',
      desc: 'Valeria Ramos y 3 alumnos subieron "Efecto Fotoeléctrico".',
      time: 'Hace 15 min',
      unread: true,
      icon: 'assignment_turned_in'
    },
    {
      id: 2,
      title: 'Alerta de Inasistencia',
      desc: 'Diego Luna acumula 2 faltas consecutivas en Física Cuántica I.',
      time: 'Hace 2 horas',
      unread: true,
      icon: 'warning'
    },
    {
      id: 3,
      title: 'Ciclo Escolar Activo Sincronizado',
      desc: `Sistema operando en ${activeCycle}`,
      time: 'Hoy',
      unread: false,
      icon: 'check_circle'
    }
  ];

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-space-lg border-b border-[#E2E8F0]">
      {/* Search Input (Global trigger) */}
      <div className="flex items-center gap-3">
        <div className="w-80">
          <div 
            onClick={onOpenSearch}
            className="relative flex items-center w-full cursor-pointer group"
          >
            <span className="material-symbols-outlined absolute left-3 text-outline text-lg pointer-events-none group-hover:text-secondary transition-colors">
              search
            </span>
            <input
              readOnly
              className="w-full h-10 pl-10 pr-space-md bg-surface-container-lowest rounded-lg text-sm text-on-surface placeholder:text-outline cursor-pointer border border-[#E2E8F0] group-hover:border-secondary/50 focus:outline-none focus:ring-1 focus:ring-secondary shadow-sm transition-all"
              placeholder="Buscar alumno, matrícula o grupo... (⌘K)"
              type="text"
            />
            <span className="absolute right-3 px-1.5 py-0.5 rounded bg-surface-container-low text-[10px] text-outline font-mono font-medium border border-[#E2E8F0]">
              ⌘K
            </span>
          </div>
        </div>

        {/* School Cycle Badge Selector in Header */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setShowCycleDropdown(!showCycleDropdown)}
            className="h-9 px-3 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
            title="Seleccionar ciclo escolar"
          >
            <span className="material-symbols-outlined text-sm text-primary">
              event
            </span>
            <span>{activeCycle}</span>
            <span className="material-symbols-outlined text-sm text-slate-400">
              arrow_drop_down
            </span>
          </button>

          {showCycleDropdown && (
            <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Cambiar Periodo Escolar
                </span>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {cycles.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectCycle(c.name);
                      setShowCycleDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer ${
                      activeCycle === c.name ? 'text-primary font-bold bg-primary/5' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <p>{c.name}</p>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {c.status === 'active' ? '● Activo' : c.status === 'upcoming' ? '○ Próximo' : 'Concluido'}
                      </span>
                    </div>
                    {activeCycle === c.name && (
                      <span className="material-symbols-outlined text-primary text-sm">
                        check
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Institution Campus Tag */}
          {institutionInfo && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100/80 border border-slate-200/80 rounded-lg text-xs text-slate-600 font-medium">
              <span className="material-symbols-outlined text-sm text-secondary">
                account_balance
              </span>
              <span className="truncate max-w-[140px] font-semibold text-slate-700">
                {institutionInfo.shortName}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-500 truncate max-w-[120px]">
                {institutionInfo.campus}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-space-md">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
            title="Notificaciones de tareas y entregas"
            type="button"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full animate-pulse"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest rounded-xl shadow-xl border border-[#E2E8F0] py-2 z-50">
              <div className="px-4 py-2 border-b border-[#E2E8F0] flex items-center justify-between">
                <span className="font-semibold text-sm text-on-surface">Notificaciones</span>
                <span className="text-[11px] text-secondary font-medium cursor-pointer hover:underline">
                  Marcar todas leídas
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-[#F1F5F9]">
                {notifications.map((item) => (
                  <div key={item.id} className="p-3 hover:bg-surface-container-low transition-colors cursor-pointer flex gap-3 items-start">
                    <span className="material-symbols-outlined text-secondary text-lg mt-0.5">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-on-surface leading-tight">{item.title}</p>
                      <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">{item.desc}</p>
                      <span className="text-[10px] text-outline mt-1 block">{item.time}</span>
                    </div>
                    {item.unread && <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 mt-1.5"></span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Help Center */}
        <button
          onClick={onOpenHelp}
          className="flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors text-xs font-medium cursor-pointer"
          title="Centro de Ayuda"
          type="button"
        >
          <span className="material-symbols-outlined text-lg">help_outline</span>
          <span className="hidden xl:inline">Ayuda</span>
        </button>

        <div className="h-6 w-px bg-outline-variant mx-space-xs"></div>

        {/* User Profile / Menu */}
        <div className="relative">
          <div 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-space-sm pl-space-xs cursor-pointer select-none group"
          >
            <div className="flex flex-col text-right">
              <span className="text-xs text-on-surface font-semibold leading-tight group-hover:text-primary transition-colors">
                {currentUser ? currentUser.name : 'Usuario'}
              </span>
              <span className="text-[11px] text-on-surface-variant leading-none">
                {currentUser?.role === 'admin'
                  ? 'Administrador del Sistema'
                  : currentUser?.department || 'Docente Titular'}
              </span>
            </div>

            {currentUser?.avatarUrl ? (
              <img
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-outline-variant group-hover:ring-secondary transition-all"
                src={currentUser.avatarUrl}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs ring-1 ring-primary/20">
                {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
              </div>
            )}
          </div>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest rounded-xl shadow-xl border border-[#E2E8F0] py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2.5 border-b border-[#E2E8F0]">
                <p className="text-xs font-bold text-on-surface truncate">
                  {currentUser?.name}
                </p>
                <p className="text-[11px] text-on-surface-variant truncate">
                  {currentUser?.email}
                </p>
                <div className="mt-1.5">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      currentUser?.role === 'admin'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-primary-fixed text-on-primary-fixed'
                    }`}
                  >
                    {currentUser?.role === 'admin'
                      ? 'Administrador de Plataforma'
                      : currentUser?.department || 'Docente Titular'}
                  </span>
                </div>
              </div>

              <div className="py-1 text-xs">
                <div className="px-4 py-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Periodo en Sesión
                </div>
                <div className="px-4 py-1 text-slate-600 font-medium text-xs flex items-center gap-1.5 mb-2">
                  <span className="material-symbols-outlined text-sm text-secondary">
                    calendar_today
                  </span>
                  <span>{activeCycle}</span>
                </div>

                <div className="border-t border-[#F1F5F9] my-1"></div>

                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
