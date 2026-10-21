/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Group, GradingCriteria } from './types';
import { INITIAL_GROUPS } from './data/mockData';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { AltaGrupoView } from './components/AltaGrupoView';
import { DashboardView } from './components/DashboardView';
import { GradebookView } from './components/GradebookView';
import { AttendanceView } from './components/AttendanceView';
import { CriteriaView } from './components/CriteriaView';
import { SearchModal } from './components/SearchModal';
import { HelpModal } from './components/HelpModal';
import { SuccessCreatedModal } from './components/SuccessCreatedModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('alta-grupo'); // Default to the main screen requested in prompt & screenshot!
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

  const [selectedGroupId, setSelectedGroupId] = useState<string>(groups[0]?.id || 'grp-fis-302');
  const [activeCycle, setActiveCycle] = useState('Ciclo 2024-2025 • P2');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [newlyCreatedGroup, setNewlyCreatedGroup] = useState<Group | null>(null);

  // Sync groups to localStorage
  useEffect(() => {
    localStorage.setItem('aulagrade_groups_data', JSON.stringify(groups));
  }, [groups]);

  // Global keyboard shortcut ⌘K
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // Handle group creation
  const handleGroupCreated = (newGroup: Group) => {
    setGroups(prev => [newGroup, ...prev]);
    setSelectedGroupId(newGroup.id);
    setNewlyCreatedGroup(newGroup);
  };

  // Update criteria for a group
  const handleUpdateCriteria = (groupId: string, criteria: GradingCriteria) => {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, criteria } : g));
  };

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased flex flex-col">
      {/* Global Collapsible Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        activeCycle={activeCycle}
        onSelectCycle={(cycle) => setActiveCycle(cycle)}
      />

      {/* Main Content Area */}
      <div className="pl-64 flex flex-col min-h-screen flex-1">
        {/* Fixed Top Header */}
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
        />

        {/* View Router */}
        <main className="w-full pt-16 bg-surface flex-1">
          {activeTab === 'alta-grupo' && (
            <AltaGrupoView
              existingGroups={groups}
              onCancel={() => setActiveTab('dashboard')}
              onGroupCreated={handleGroupCreated}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              groups={groups}
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
            />
          )}

          {activeTab === 'cuaderno' && (
            <GradebookView
              groups={groups}
              selectedGroupId={selectedGroupId}
              onSelectGroup={(id) => setSelectedGroupId(id)}
              onOpenCreateGroup={() => setActiveTab('alta-grupo')}
            />
          )}

          {activeTab === 'asistencia' && (
            <AttendanceView
              groups={groups}
              selectedGroupId={selectedGroupId}
              onSelectGroup={(id) => setSelectedGroupId(id)}
              onOpenCreateGroup={() => setActiveTab('alta-grupo')}
            />
          )}

          {activeTab === 'criterios' && (
            <CriteriaView
              groups={groups}
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
        groups={groups}
        onSelectGroup={(groupId, tab) => {
          setSelectedGroupId(groupId);
          setActiveTab(tab);
        }}
      />

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

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
          setActiveTab('dashboard');
        }}
      />
    </div>
  );
}
