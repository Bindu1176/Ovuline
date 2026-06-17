import { 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where,
  doc,
  deleteDoc
} from "firebase/firestore";
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  onAuthStateChanged
} from "firebase/auth";
import { db, auth, isFirebaseConfigured } from "./firebase";
import { UserProfile, PeriodCycle } from "../types";

// Compliant Firestore Operation Error Types as requested in Skill.md
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
  }
}

// Global Firestore Error handler complying exactly with the security rules debugging format
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Secure Handled Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface ExtendedProfile extends UserProfile {
  email?: string;
  preferences?: {
    theme?: "light" | "dark";
    language?: "en" | "hi" | "es";
    density?: "compact" | "high-density";
  };
  healthHistory?: {
    hasDermatologyNotes?: boolean;
    pelvicPainLevel?: "None" | "Mild" | "Severe";
    insulinResistanceIndex?: number;
    diagnosedPCOS?: boolean;
    familyPCOSHistory?: boolean;
  };
}

// Primary API proxy supporting fully secure real time integrations when Firebase is compiled
export const profileService = {
  // 1. Fetch User profile from Firestore
  async getUserProfile(userId: string): Promise<ExtendedProfile | null> {
    if (!isFirebaseConfigured) {
      // Offline fallback from local storage
      const saved = localStorage.getItem(`ovuline_profile_${userId}`);
      if (saved) return JSON.parse(saved);
      return null;
    }

    const path = `users/${userId}`;
    try {
      const docSnap = await getDoc(doc(db, "users", userId));
      if (docSnap.exists()) {
        return docSnap.data() as ExtendedProfile;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  // 2. Save User profile
  async saveUserProfile(userId: string, profile: ExtendedProfile): Promise<void> {
    if (!isFirebaseConfigured) {
      localStorage.setItem(`ovuline_profile_${userId}`, JSON.stringify(profile));
      localStorage.setItem("ovuline_profile", JSON.stringify(profile)); // global fallback
      return;
    }

    const path = `users/${userId}`;
    try {
      await setDoc(doc(db, "users", userId), profile, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // 3. Log an individual period cycle
  async logCycle(userId: string, cycle: PeriodCycle): Promise<void> {
    if (!isFirebaseConfigured) {
      const parent = localStorage.getItem(`ovuline_cycles_${userId}`);
      const list: PeriodCycle[] = parent ? JSON.parse(parent) : [];
      const updated = [cycle, ...list.filter(c => c.id !== cycle.id)];
      localStorage.setItem(`ovuline_cycles_${userId}`, JSON.stringify(updated));
      return;
    }

    const path = `users/${userId}/cycles/${cycle.id}`;
    try {
      await setDoc(doc(db, "users", userId, "cycles", cycle.id), cycle);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // 4. Load all user cycles
  async getUserCycles(userId: string): Promise<PeriodCycle[]> {
    if (!isFirebaseConfigured) {
      const saved = localStorage.getItem(`ovuline_cycles_${userId}`);
      if (saved) return JSON.parse(saved);
      return [];
    }

    const path = `users/${userId}/cycles`;
    try {
      const q = collection(db, "users", userId, "cycles");
      const querySnap = await getDocs(q);
      const cycles: PeriodCycle[] = [];
      querySnap.forEach((docSnap) => {
        cycles.push(docSnap.data() as PeriodCycle);
      });
      return cycles.sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  // 5. Delete a logged cycle
  async deleteCycle(userId: string, cycleId: string): Promise<void> {
    if (!isFirebaseConfigured) {
      const parent = localStorage.getItem(`ovuline_cycles_${userId}`);
      if (parent) {
        const list: PeriodCycle[] = JSON.parse(parent);
        const filtered = list.filter(c => c.id !== cycleId);
        localStorage.setItem(`ovuline_cycles_${userId}`, JSON.stringify(filtered));
      }
      return;
    }

    const path = `users/${userId}/cycles/${cycleId}`;
    try {
      await deleteDoc(doc(db, "users", userId, "cycles", cycleId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
};
