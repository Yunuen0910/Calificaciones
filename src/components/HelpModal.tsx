/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0]">
        <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
          <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-lg">help_outline</span>
            <span>Centro de Ayuda AulaGrade</span>
          </h3>
          <button onClick={onClose} className="text-outline hover:text-on-surface cursor-pointer">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        <div className="py-4 flex flex-col gap-4 text-xs text-on-surface">
          <div>
            <h4 className="font-bold text-primary mb-1">Dar de Alta Grupos y Matriculación</h4>
            <p className="text-on-surface-variant leading-relaxed">
              Puedes cargar hasta 150 alumnos importando una plantilla Excel/CSV, sincronizando con el conector Banner/SIS, o escribiéndolos en el modo manual.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-primary mb-1">Cálculo Ponderado en Cuaderno de Notas</h4>
            <p className="text-on-surface-variant leading-relaxed">
              El promedio final es recalculado instantáneamente en base a los pesos configurados en la Etapa 3 (Trabajos, Exámenes, Asistencia, Participación y Autoevaluación) sumando 100%.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-primary mb-1">Atajos de Teclado</h4>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono-numeric">
              <div className="p-2 bg-surface-container-low rounded border border-[#E2E8F0] flex justify-between">
                <span>Buscar en todo el sistema</span>
                <kbd className="bg-white px-1.5 py-0.5 rounded border text-[10px] font-bold">⌘K</kbd>
              </div>
              <div className="p-2 bg-surface-container-low rounded border border-[#E2E8F0] flex justify-between">
                <span>Cerrar diálogos</span>
                <kbd className="bg-white px-1.5 py-0.5 rounded border text-[10px] font-bold">Esc</kbd>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#F1F5F9]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-container"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
