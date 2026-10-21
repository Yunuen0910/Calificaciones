/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Group } from '../types';
import { NavTab } from './Sidebar';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: Group[];
  onSelectGroup: (groupId: string, tab: NavTab) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  groups,
  onSelectGroup,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(query.toLowerCase()) || 
    g.code.toLowerCase().includes(query.toLowerCase()) ||
    g.classroom.toLowerCase().includes(query.toLowerCase())
  );

  const matchedStudents: Array<{ student: any; groupName: string; groupId: string }> = [];
  groups.forEach(g => {
    g.students.forEach(s => {
      if (
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.matricula.toLowerCase().includes(query.toLowerCase()) ||
        s.email.toLowerCase().includes(query.toLowerCase())
      ) {
        matchedStudents.push({ student: s, groupName: g.name, groupId: g.id });
      }
    });
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="bg-surface-container-lowest rounded-xl max-w-xl w-full shadow-2xl border border-[#E2E8F0] overflow-hidden flex flex-col">
        {/* Search Input */}
        <div className="p-3 border-b border-[#E2E8F0] flex items-center gap-2">
          <span className="material-symbols-outlined text-outline text-xl">search</span>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar alumno por nombre o matrícula, grupo, aula..."
            className="w-full text-sm text-on-surface bg-transparent focus:outline-none"
          />
          <button onClick={onClose} className="text-xs px-2 py-1 rounded bg-surface-container-low text-on-surface-variant hover:bg-surface-container">
            Esc
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2 flex flex-col gap-3">
          {/* Groups */}
          <div>
            <span className="px-2 text-[10px] uppercase font-bold text-outline tracking-wider block mb-1">
              Grupos Académicos ({filteredGroups.length})
            </span>
            {filteredGroups.length === 0 ? (
              <p className="px-2 text-xs text-on-surface-variant italic">No hay grupos coincidentes</p>
            ) : (
              <div className="flex flex-col gap-1">
                {filteredGroups.map(g => (
                  <div
                    key={g.id}
                    onClick={() => {
                      onSelectGroup(g.id, 'cuaderno');
                      onClose();
                    }}
                    className="p-2 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-base">science</span>
                      <div>
                        <span className="text-xs font-bold text-on-surface">{g.name}</span>
                        <span className="text-[11px] text-on-surface-variant ml-2 font-mono-numeric">{g.code} • {g.section}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-outline bg-surface-container px-2 py-0.5 rounded font-mono-numeric">
                      {g.classroom}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Students */}
          <div>
            <span className="px-2 text-[10px] uppercase font-bold text-outline tracking-wider block mb-1">
              Estudiantes ({matchedStudents.length})
            </span>
            {matchedStudents.length === 0 ? (
              <p className="px-2 text-xs text-on-surface-variant italic">No se encontraron estudiantes</p>
            ) : (
              <div className="flex flex-col gap-1">
                {matchedStudents.slice(0, 6).map(({ student, groupName, groupId }) => (
                  <div
                    key={`${groupId}-${student.id}`}
                    onClick={() => {
                      onSelectGroup(groupId, 'cuaderno');
                      onClose();
                    }}
                    className="p-2 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {student.avatarUrl ? (
                        <img src={student.avatarUrl} alt={student.name} className="w-5 h-5 rounded-full object-cover ring-1 ring-[#E2E8F0]" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-mono-numeric text-[9px] font-bold">
                          {student.initials || 'ES'}
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-semibold text-on-surface">{student.name}</span>
                        <span className="text-[11px] text-on-surface-variant ml-2 font-mono-numeric">{student.matricula}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-secondary font-semibold">
                      {groupName}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-surface-container-low border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-on-surface-variant">
          <span>Pulsa Enter para abrir • Tab para navegar</span>
          <span className="font-mono-numeric font-medium">AulaGrade QuickSearch</span>
        </div>
      </div>
    </div>
  );
};
