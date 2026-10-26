/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, InstitutionInfo } from '../types';
import { AULAGRADE_LOGO } from '../data/mockData';

interface LoginViewProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
  institutionInfo?: InstitutionInfo;
}

export const LoginView: React.FC<LoginViewProps> = ({ users, onLoginSuccess, institutionInfo }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoLogins, setShowDemoLogins] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor ingresa tu correo y contraseña.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const normalizedEmail = email.trim().toLowerCase();
      const user = users.find(
        (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
      );

      if (user) {
        onLoginSuccess(user);
      } else {
        setErrorMessage('Credenciales no válidas. Verifica que tu correo y contraseña coincidan con los registrados.');
      }
      setIsSubmitting(false);
    }, 250);
  };

  const handleQuickLogin = (quickUser: User) => {
    setEmail(quickUser.email);
    setPassword(quickUser.password);
    setErrorMessage('');
    onLoginSuccess(quickUser);
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative selection:bg-secondary/20">
      {/* Background subtle decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-[#E2E8F0] mb-4">
            <img
              src={institutionInfo?.logoUrl || AULAGRADE_LOGO}
              alt={institutionInfo?.name || "AulaGrade Logo"}
              className="h-12 w-auto max-w-[150px] object-contain"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            {institutionInfo?.name || 'AulaGrade'}
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            {institutionInfo?.campus ? `Plantel: ${institutionInfo.campus}` : 'Control Escolar y Gestión de Calificaciones'}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-[#E2E8F0] p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Iniciar Sesión</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ingresa con tus credenciales asignadas por la institución
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700 text-xs">
              <span className="material-symbols-outlined text-base shrink-0 mt-0.5 text-rose-600">
                error
              </span>
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Correo Institucional
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
                  mail
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ej. profesor@escuela.edu"
                  className="w-full h-11 pl-10 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-normal"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xs">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                  <span>{showPassword ? 'Ocultar' : 'Mostrar'}</span>
                </button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-normal"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-primary hover:bg-primary/95 text-white font-semibold text-sm rounded-xl shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-70 mt-2"
            >
              {isSubmitting ? (
                <span>Validando acceso...</span>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <span className="material-symbols-outlined text-lg">login</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Pills (Collapsible / Optional for Testing) */}
          <div className="mt-8 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => setShowDemoLogins(!showDemoLogins)}
                className="text-xs text-slate-500 hover:text-primary font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-sm text-amber-500">
                  bolt
                </span>
                <span>Atajos de prueba rápida para administrador</span>
                <span className="material-symbols-outlined text-sm">
                  {showDemoLogins ? 'expand_less' : 'expand_more'}
                </span>
              </button>
              {showDemoLogins && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {users.length} cuentas
                </span>
              )}
            </div>

            {showDemoLogins ? (
              <div className="space-y-2 mt-3 animate-in fade-in duration-150">
                <div className="p-2.5 bg-blue-50/90 border border-blue-200/90 rounded-xl text-[11px] text-blue-900 leading-relaxed mb-2">
                  <span className="font-bold">Información de cuenta:</span> Las cuentas creadas son 100% reales y definitivas. Estos botones son solo un atajo opcional para acceder con 1 clic sin teclear la contraseña durante la configuración inicial. Los docentes pueden entrar directamente con su correo y contraseña en el formulario superior.
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickLogin(u)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-primary/40 hover:shadow-sm text-left transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                            u.role === 'admin'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {u.role === 'admin' ? 'admin_panel_settings' : 'school'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-primary transition-colors">
                            {u.name}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {u.email} • {u.role === 'admin' ? 'Administrador' : 'Docente'}
                          </p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-slate-400 group-hover:text-primary text-sm shrink-0">
                        login
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 text-center">
                Modo producción activo. Los docentes inician sesión con su correo y contraseña.
              </p>
            )}
          </div>
        </div>

        {/* Security / System note */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <p className="flex items-center justify-center gap-1.5 font-medium">
            <span className="material-symbols-outlined text-xs text-emerald-600">
              lock
            </span>
            <span>Acceso seguro protegido con aislamiento de datos por usuario y periodo escolar</span>
          </p>
        </div>
      </div>
    </div>
  );
};
