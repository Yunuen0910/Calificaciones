/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Group, GradingCriteria, AssignmentGrade, User, AcademicCycle } from './types';
import {
  INITIAL_GROUPS,
  INITIAL_ASSIGNMENTS,
  INITIAL_STUDENT_SCORES,
  INITIAL_USERS,
  INITIAL_CYCLES,
} from './data/mockData';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { AdminPanel } from './components/AdminPanel';
import { AltaGrupoView } from './components/AltaGrupoView';
import { DashboardView } from './components/DashboardView';
import { GradebookView } from './components/GradebookView';
import { FinalGradesView } from './components/FinalGradesView';
import { AttendanceView } from './components/AttendanceView';
import { CriteriaView } from './components/CriteriaView';
import { SearchModal } from './components/SearchModal';
import { HelpModal } from './components/HelpModal';
import { SuccessCreatedModal } from './components/SuccessCreatedModal';

export default function App() {
  // 1. Users state
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('aulagrade_users_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse users', e);
      }
    }
    return INITIAL_USERS;
  });

  // 2. Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('aulagrade_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse auth user', e);
      }
    }
    // Default to the teacher Carlos Mendoza for convenience or null if clean start
    return INITIAL_USERS.find((u) => u.email === 'c.mendoza@aulagrade.edu') || INITIAL_USERS[0];
  });

  // 3. Academic Cycles state
  const [cycles, setCycles] = useState<AcademicCycle[]>(() => {
    const saved = localStorage.getItem('aulagrade_cycles_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cycles', e);
      }
    }
    return INITIAL_CYCLES;
  });

  const [activeCycle, setActiveCycle] = useState<string>(() => {
    const saved = localStorage.getItem('aulagrade_active_cycle');
    if (saved) return saved;
    const defaultCycle = cycles.find((c) => c.status === 'active' || c.isDefault);
    return defaultCycle ? defaultCycle.name : 'Ciclo 2024-2025 • P2';
  });

  // 4. Groups state
  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem('aulagrade_groups_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved groups', e);
      }
    }
    return INITIAL_GROUPS;
  });

  // 5. Active navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    if (currentUser?.role === 'admin') return 'admin-panel';
    return 'dashboard';
  });

  // 6. Selected group ID
  const [selectedGroupId, setSelectedGroupId] = useState<string>(() => {
    return groups[0]?.id || 'grp-fis-302';
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [newlyCreatedGroup, setNewlyCreatedGroup] = useState<Group | null>(null);

  // 7. Shared assignments & scores state
  const [assignments, setAssignments] = useState<AssignmentGrade[]>(() => {
    const saved = localStorage.getItem('aulagrade_assignments_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved assignments', e);
      }
    }
    return INITIAL_ASSIGNMENTS;
  });

  const [scores, setScores] = useState<Record<string, Record<string, number>>>(() => {
    const saved = localStorage.getItem('aulagrade_scores_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved scores', e);
      }
    }
    return INITIAL_STUDENT_SCORES;
  });

  // Synchronize to localStorage
  useEffect(() => {
    localStorage.setItem('aulagrade_users_data', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('aulagrade_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('aulagrade_auth_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('aulagrade_cycles_data', JSON.stringify(cycles));
  }, [cycles]);

  useEffect(() => {
    localStorage.setItem('aulagrade_active_cycle', activeCycle);
  }, [activeCycle]);

  useEffect(() => {
    localStorage.setItem('aulagrade_groups_data', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('aulagrade_assignments_data', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('aulagrade_scores_data', JSON.stringify(scores));
  }, [scores]);

  // Global keyboard shortcut ⌘K
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // Filter groups visible to current user based on role and academic cycle
  const visibleGroups = useMemo(() => {
    if (!currentUser) return [];

    let filtered = groups;

    // Filter by teacher role if teacher
    if (currentUser.role === 'teacher') {
      filtered = filtered.filter(
        (g) =>
          g.teacherId === currentUser.id ||
          !g.teacherId ||
          currentUser.assignedGroupIds?.includes(g.id)
      );
    }

    // Filter by active cycle
    if (activeCycle) {
      filtered = filtered.filter(
        (g) => !g.academicCycle || g.academicCycle === activeCycle
      );
    }

    return filtered;
  }, [groups, currentUser, activeCycle]);

  // Keep selectedGroupId pointing to a valid visible group if available
  useEffect(() => {
    if (visibleGroups.length > 0) {
      const exists = visibleGroups.some((g) => g.id === selectedGroupId);
      if (!exists) {
        setSelectedGroupId(visibleGroups[0].id);
      }
    }
  }, [visibleGroups, selectedGroupId]);

  // Group creation
  const handleGroupCreated = (newGroup: Group) => {
    setGroups((prev) => [newGroup, ...prev]);
    setSelectedGroupId(newGroup.id);
    setNewlyCreatedGroup(newGroup);

    // Also link group to current teacher if logged in
    if (currentUser && currentUser.role === 'teacher') {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === currentUser.id
            ? {
                ...u,
                assignedGroupIds: [...(u.assignedGroupIds || []), newGroup.id],
              }
            : u
        )
      );
    }
  };

  // Update criteria for a group
  const handleUpdateCriteria = (groupId: string, criteria: GradingCriteria) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, criteria } : g))
    );
  };

  // Admin user operations
  const handleAddUser = (newUser: User) => {
    setUsers((prev) => [newUser, ...prev]);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Admin cycle operations
  const handleAddCycle = (newCycle: AcademicCycle) => {
    setCycles((prev) => [newCycle, ...prev]);
  };

  const handleUpdateCycle = (updatedCycle: AcademicCycle) => {
    setCycles((prev) =>
      prev.map((c) => (c.id === updatedCycle.id ? updatedCycle : c))
    );
  };

  // Backup & Restore
  const handleExportBackup = () => {
    const backupData = {
      app: 'AulaGrade',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      activeCycle,
      users,
      cycles,
      groups,
      assignments,
      scores,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `aulagrade_respaldo_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') return false;

      if (Array.isArray(data.users)) setUsers(data.users);
      if (Array.isArray(data.cycles)) setCycles(data.cycles);
      if (Array.isArray(data.groups)) setGroups(data.groups);
      if (Array.isArray(data.assignments)) setAssignments(data.assignments);
      if (data.scores && typeof data.scores === 'object') setScores(data.scores);
      if (data.activeCycle && typeof data.activeCycle === 'string') {
        setActiveCycle(data.activeCycle);
      }
      return true;
    } catch (e) {
      console.error('Import error', e);
      return false;
    }
  };

  const handleResetDatabase = () => {
    localStorage.removeItem('aulagrade_users_data');
    localStorage.removeItem('aulagrade_cycles_data');
    localStorage.removeItem('aulagrade_groups_data');
    localStorage.removeItem('aulagrade_assignments_data');
    localStorage.removeItem('aulagrade_scores_data');
    localStorage.removeItem('aulagrade_active_cycle');

    setUsers(INITIAL_USERS);
    setCycles(INITIAL_CYCLES);
    setGroups(INITIAL_GROUPS);
    setAssignments(INITIAL_ASSIGNMENTS);
    setScores(INITIAL_STUDENT_SCORES);
    setActiveCycle('Ciclo 2024-2025 • P2');
    setSelectedGroupId('grp-fis-302');
  };

  // Login handler
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setActiveTab('admin-panel');
    } else {
      setActiveTab('dashboard');
    }
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
  };

  // If no user is logged in, show the Login screen
  if (!currentUser) {
    return <LoginView users={users} onLoginSuccess={handleLoginSuccess} />;
  }

  // Groups to pass to views (if admin is viewing dashboard/cuaderno, let them see visible groups or all if visible is empty)
  const activeViewGroups = visibleGroups.length > 0 ? visibleGroups : groups;

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased flex flex-col">
      {/* Global Collapsible Sidebar */}
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        activeCycle={activeCycle}
        cycles={cycles}
        onSelectCycle={(cycle) => setActiveCycle(cycle)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="pl-64 flex flex-col min-h-screen flex-1">
        {/* Fixed Top Header */}
        <Header
          currentUser={currentUser}
          onLogout={handleLogout}
          activeCycle={activeCycle}
          cycles={cycles}
          onSelectCycle={(cycle) => setActiveCycle(cycle)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
        />

        {/* View Router */}
        <main className="w-full pt-16 bg-surface flex-1">
          {/* Notice when teacher has no groups in the selected cycle */}
          {currentUser.role === 'teacher' &&
            visibleGroups.length === 0 &&
            activeTab !== 'alta-grupo' && (
              <div className="p-6 m-6 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-amber-600 text-2xl">
                    info
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-amber-900">
                      Sin materias registradas en {activeCycle}
                    </h3>
                    <p className="text-xs text-amber-700">
                      No tienes grupos asignados en este ciclo escolar. Puedes dar de alta un nuevo grupo o cambiar de periodo en el selector superior.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('alta-grupo')}
                  className="px-4 py-2 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-semibold shrink-0 cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  <span>Registrar Materia en este Ciclo</span>
                </button>
              </div>
            )}

          {activeTab === 'admin-panel' && currentUser.role === 'admin' && (
            <AdminPanel
              users={users}
              cycles={cycles}
              groups={groups}
              activeCycle={activeCycle}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onAddCycle={handleAddCycle}
              onUpdateCycle={handleUpdateCycle}
              onSelectActiveCycle={(cycleName) => setActiveCycle(cycleName)}
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
              onResetDatabase={handleResetDatabase}
            />
          )}

          {activeTab === 'alta-grupo' && (
            <AltaGrupoView
              existingGroups={groups}
              activeCycle={activeCycle}
              cycles={cycles}
              currentUser={currentUser}
              onCancel={() =>
                setActiveTab(currentUser.role === 'admin' ? 'admin-panel' : 'dashboard')
              }
              onGroupCreated={handleGroupCreated}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              groups={activeViewGroups}
              onOpenCreateGroup={() => setActiveTab('alta-grupo')}
              onSelectGroupForGrades={(g) => {
                setSelectedGroupId(g.id);
                setActiveTab('cuaderno');
              }}
              onSelectGroupForAttendance={(g) => {
                setSelectedGroupId(g.id);
                setActiveTab('asistencia');
              }}
              onSelectGroupForCriteria={(g) => {
                setSelectedGroupId(g.id);
                setActiveTab('criterios');
              }}
              onSelectGroupForFinalGrades={(g) => {
                setSelectedGroupId(g.id);
                setActiveTab('calificaciones-finales');
              }}
            />
          )}

          {activeTab === 'cuaderno' && (
            <GradebookView
              groups={activeViewGroups}
              selectedGroupId={selectedGroupId}
              onSelectGroup={(id) => setSelectedGroupId(id)}
              onOpenCreateGroup={() => setActiveTab('alta-grupo')}
              assignments={assignments}
              setAssignments={setAssignments}
              scores={scores}
              setScores={setScores}
              onNavigateToFinalGrades={() => setActiveTab('calificaciones-finales')}
            />
          )}

          {activeTab === 'calificaciones-finales' && (
            <FinalGradesView
              groups={activeViewGroups}
              selectedGroupId={selectedGroupId}
              onSelectGroup={(id) => setSelectedGroupId(id)}
              assignments={assignments}
              scores={scores}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'asistencia' && (
            <AttendanceView
              groups={activeViewGroups}
              selectedGroupId={selectedGroupId}
              onSelectGroup={(id) => setSelectedGroupId(id)}
              onOpenCreateGroup={() => setActiveTab('alta-grupo')}
            />
          )}

          {activeTab === 'criterios' && (
            <CriteriaView
              groups={activeViewGroups}
              selectedGroupId={selectedGroupId}
              onSelectGroup={(id) => setSelectedGroupId(id)}
              onUpdateCriteria={handleUpdateCriteria}
              onOpenCreateGroup={() => setActiveTab('alta-grupo')}
            />
          )}
        </main>
      </div>

      {/* Quick Search Palette (⌘K) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        groups={activeViewGroups}
        onSelectGroup={(groupId, tab) => {
          setSelectedGroupId(groupId);
          setActiveTab(tab);
        }}
      />

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Group Activated Celebration Modal */}
      <SuccessCreatedModal
        isOpen={!!newlyCreatedGroup}
        group={newlyCreatedGroup}
        onGoToGrades={() => {
          setNewlyCreatedGroup(null);
          setActiveTab('cuaderno');
        }}
        onGoToAttendance={() => {
          setNewlyCreatedGroup(null);
          setActiveTab('asistencia');
        }}
        onGoToDashboard={() => {
          setNewlyCreatedGroup(null);
          setActiveTab(currentUser?.role === 'admin' ? 'admin-panel' : 'dashboard');
        }}
      />
    </div>
  );
}
