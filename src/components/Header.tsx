/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PROF_AVATAR } from '../data/mockData';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenHelp: () => void;
  unreadNotificationsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenHelp,
  unreadNotificationsCount = 3,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

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
      title: 'Ponderación 100% Verificada',
      desc: 'Criterios de evaluación para Ciclo 2024-2025 • P2 validados.',
      time: 'Ayer',
      unread: false,
      icon: 'check_circle'
    }
  ];

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-space-lg border-b border-[#E2E8F0]">
      {/* Search Input (Global trigger) */}
      <div className="w-96">
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

      {/* Right Controls */}
      <div className="flex items-center gap-space-md">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
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
          className="flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors text-xs font-medium"
          title="Centro de Ayuda"
          type="button"
        >
          <span className="material-symbols-outlined text-lg">help_outline</span>
          <span className="hidden xl:inline">Ayuda</span>
        </button>

        <div className="h-6 w-px bg-outline-variant mx-space-xs"></div>

        {/* Teacher Profile */}
        <div className="relative">
          <div 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-space-sm pl-space-xs cursor-pointer select-none group"
          >
            <div className="flex flex-col text-right">
              <span className="text-xs text-on-surface font-semibold leading-tight group-hover:text-primary transition-colors">
                Prof. Carlos Mendoza
              </span>
              <span className="text-[11px] text-on-surface-variant leading-none">
                Docente Titular
              </span>
            </div>
            <img
              alt="Prof. Carlos Mendoza"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-outline-variant group-hover:ring-secondary transition-all"
              src={PROF_AVATAR}
            />
          </div>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-xl border border-[#E2E8F0] py-2 z-50">
              <div className="px-4 py-2 border-b border-[#E2E8F0]">
                <p className="text-xs font-bold text-on-surface">Carlos Mendoza S.</p>
                <p className="text-[11px] text-on-surface-variant">c.mendoza@aulagrade.edu</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-[10px] font-semibold">
                  Departamento de Ciencias Exactas
                </span>
              </div>
              <div className="py-1 text-xs">
                <a href="#perfil" className="flex items-center gap-2 px-4 py-2 text-on-surface hover:bg-surface-container-low">
                  <span className="material-symbols-outlined text-sm">person</span>
                  <span>Mi Perfil Docente</span>
                </a>
                <a href="#configuracion" className="flex items-center gap-2 px-4 py-2 text-on-surface hover:bg-surface-container-low">
                  <span className="material-symbols-outlined text-sm">settings</span>
                  <span>Configuración Académica</span>
                </a>
                <a href="#export" className="flex items-center gap-2 px-4 py-2 text-on-surface hover:bg-surface-container-low">
                  <span className="material-symbols-outlined text-sm">ios_share</span>
                  <span>Exportar Reportes SIS</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
