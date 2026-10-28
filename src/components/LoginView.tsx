/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, InstitutionInfo } from '../types';
import { AULAGRADE_LOGO } from '../data/mockData';
import { loginWithGoogle } from '../firebase';

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

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      const googleUser = await loginWithGoogle();
      if (!googleUser || !googleUser.email) return;

      const normalizedEmail = googleUser.email.toLowerCase();
      let matchedUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);

      if (normalizedEmail === 'yunuen.0910@gmail.com') {
        if (!matchedUser) {
          matchedUser = {
            id: `usr-admin-${Date.now()}`,
            name: googleUser.displayName || 'Directora General',
            email: normalizedEmail,
            password: 'google-oauth-account',
            role: 'admin',
            createdAt: new Date().toISOString(),
          };
        } else {
          matchedUser = { ...matchedUser, role: 'admin' };
        }
      } else if (!matchedUser) {
        matchedUser = {
          id: `usr-prof-${Date.now()}`,
          name: googleUser.displayName || googleUser.email.split('@')[0],
          email: normalizedEmail,
          password: 'google-oauth-account',
          role: 'teacher',
          createdAt: new Date().toISOString(),
        };
      }

      onLoginSuccess(matchedUser);
    } catch (err: unknown) {
      console.error('Google sign in error', err);
      setErrorMessage('No fue posible completar el inicio de sesión con Google. Puedes ingresar con tu correo y contraseña.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  <span>Ingresar con Contraseña</span>
                  <span className="material-symbols-outlined text-lg">login</span>
                </>
              )}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-3 text-slate-400 font-bold tracking-wider">
                  o accede con
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full h-11 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-70 active:scale-[0.99]"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar con Cuenta Google</span>
            </button>
          </form>
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
