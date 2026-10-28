/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  User,
  AcademicCycle,
  Group,
  AssignmentGrade,
  InstitutionInfo,
} from './types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without this line
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error handler conforming to Firebase skill specifications
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

// Test connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified successfully');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or waiting for sync');
    }
    return false;
  }
}

// Real-time synchronization listeners
export function subscribeToSchools(
  onUpdate: (schools: InstitutionInfo[]) => void
): () => void {
  const colRef = collection(db, 'schools');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const data: InstitutionInfo[] = [];
      snapshot.forEach((docSnap) => {
        data.push(docSnap.data() as InstitutionInfo);
      });
      if (data.length > 0) {
        onUpdate(data);
      }
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'schools')
  );
}

export function subscribeToUsers(
  onUpdate: (users: User[]) => void
): () => void {
  const colRef = collection(db, 'users');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const data: User[] = [];
      snapshot.forEach((docSnap) => {
        data.push(docSnap.data() as User);
      });
      if (data.length > 0) {
        onUpdate(data);
      }
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'users')
  );
}

export function subscribeToCycles(
  onUpdate: (cycles: AcademicCycle[]) => void
): () => void {
  const colRef = collection(db, 'cycles');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const data: AcademicCycle[] = [];
      snapshot.forEach((docSnap) => {
        data.push(docSnap.data() as AcademicCycle);
      });
      if (data.length > 0) {
        onUpdate(data);
      }
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'cycles')
  );
}

export function subscribeToGroups(
  onUpdate: (groups: Group[]) => void
): () => void {
  const colRef = collection(db, 'groups');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const data: Group[] = [];
      snapshot.forEach((docSnap) => {
        data.push(docSnap.data() as Group);
      });
      onUpdate(data);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'groups')
  );
}

export function subscribeToAssignments(
  onUpdate: (assignments: AssignmentGrade[]) => void
): () => void {
  const colRef = collection(db, 'assignments');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const data: AssignmentGrade[] = [];
      snapshot.forEach((docSnap) => {
        data.push(docSnap.data() as AssignmentGrade);
      });
      onUpdate(data);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'assignments')
  );
}

export function subscribeToScores(
  onUpdate: (scores: Record<string, Record<string, number>>) => void
): () => void {
  const colRef = collection(db, 'scores');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const allScores: Record<string, Record<string, number>> = {};
      snapshot.forEach((docSnap) => {
        const item = docSnap.data();
        if (item.studentScores) {
          allScores[docSnap.id] = item.studentScores;
        }
      });
      onUpdate(allScores);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'scores')
  );
}

// Write Operations
export async function syncSchoolToCloud(school: InstitutionInfo) {
  try {
    await setDoc(doc(db, 'schools', school.id), school);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `schools/${school.id}`);
  }
}

export async function deleteSchoolFromCloud(schoolId: string) {
  try {
    await deleteDoc(doc(db, 'schools', schoolId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `schools/${schoolId}`);
  }
}

export async function syncUserToCloud(user: User) {
  try {
    await setDoc(doc(db, 'users', user.id), user);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.id}`);
  }
}

export async function deleteUserFromCloud(userId: string) {
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `users/${userId}`);
  }
}

export async function syncCycleToCloud(cycle: AcademicCycle) {
  try {
    await setDoc(doc(db, 'cycles', cycle.id), cycle);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `cycles/${cycle.id}`);
  }
}

export async function syncGroupToCloud(group: Group) {
  try {
    await setDoc(doc(db, 'groups', group.id), group);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `groups/${group.id}`);
  }
}

export async function deleteGroupFromCloud(groupId: string) {
  try {
    await deleteDoc(doc(db, 'groups', groupId));
    await deleteDoc(doc(db, 'scores', groupId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `groups/${groupId}`);
  }
}

export async function deleteAssignmentFromCloud(assignmentId: string) {
  try {
    await deleteDoc(doc(db, 'assignments', assignmentId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `assignments/${assignmentId}`);
  }
}

export async function syncAssignmentToCloud(assignment: AssignmentGrade) {
  try {
    await setDoc(doc(db, 'assignments', assignment.id), assignment);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `assignments/${assignment.id}`);
  }
}

export async function syncScoresToCloud(
  groupId: string,
  studentScores: Record<string, number>
) {
  try {
    await setDoc(doc(db, 'scores', groupId), {
      groupId,
      studentScores,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `scores/${groupId}`);
  }
}

export async function clearAllCloudGroupsAndScores(): Promise<void> {
  try {
    const groupSnap = await getDocs(collection(db, 'groups'));
    const scoreSnap = await getDocs(collection(db, 'scores'));
    const asgSnap = await getDocs(collection(db, 'assignments'));
    const batch = writeBatch(db);

    groupSnap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    scoreSnap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    asgSnap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    await batch.commit();
    console.log('Cleared all cloud groups, scores, and assignments successfully');
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, 'clear-all-groups-cloud');
  }
}

export async function clearDemoStudentsFromCloudGroups(groupsToClean: Group[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    groupsToClean.forEach((g) => {
      batch.set(doc(db, 'groups', g.id), { ...g, students: [] });
    });
    const scoreSnap = await getDocs(collection(db, 'scores'));
    scoreSnap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
    console.log('Cleared demo students from cloud groups successfully');
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'clear-demo-students-cloud');
  }
}

export async function deleteDemoTeachersFromCloud(): Promise<void> {
  try {
    const demoTeacherIds = ['usr-prof-1', 'usr-prof-2'];
    const batch = writeBatch(db);
    demoTeacherIds.forEach((id) => {
      batch.delete(doc(db, 'users', id));
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, 'delete-demo-teachers');
  }
}

// Seed cloud database if it has no records yet
export async function seedInitialCloudDataIfEmpty(
  initialSchools: InstitutionInfo[],
  initialUsers: User[],
  initialCycles: AcademicCycle[],
  initialGroups: Group[],
  initialAssignments: AssignmentGrade[],
  initialScores: Record<string, Record<string, number>>
) {
  try {
    const schoolSnap = await getDocs(collection(db, 'schools'));
    if (schoolSnap.empty) {
      console.log('Seeding initial cloud database...');
      const batch = writeBatch(db);

      // Seed schools
      initialSchools.forEach((s) => {
        batch.set(doc(db, 'schools', s.id), s);
      });

      // Seed users
      initialUsers.forEach((u) => {
        batch.set(doc(db, 'users', u.id), u);
      });

      // Seed cycles
      initialCycles.forEach((c) => {
        batch.set(doc(db, 'cycles', c.id), c);
      });

      // Seed groups
      initialGroups.forEach((g) => {
        batch.set(doc(db, 'groups', g.id), g);
      });

      // Seed assignments
      initialAssignments.forEach((a) => {
        batch.set(doc(db, 'assignments', a.id), a);
      });

      // Seed scores
      Object.entries(initialScores).forEach(([groupId, scoreMap]) => {
        batch.set(doc(db, 'scores', groupId), {
          groupId,
          studentScores: scoreMap,
          updatedAt: new Date().toISOString(),
        });
      });

      await batch.commit();
      console.log('Initial cloud database seed completed.');
    }
  } catch (err) {
    console.warn('Initial cloud seed skipped or error:', err);
  }
}

// Google Login helper
export async function loginWithGoogle(): Promise<{
  email: string | null;
  displayName: string | null;
  uid: string;
} | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return {
      email: result.user.email,
      displayName: result.user.displayName,
      uid: result.user.uid,
    };
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
}

export async function logoutFromFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {
    console.error('Error signing out', e);
  }
}
