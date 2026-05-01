"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export type UserRole = "donor" | "ngo" | "volunteer" | "admin";

interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  location?: { lat: number; lng: number };
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
  demoLogin: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo profiles — these get written to Firestore so all queries work
const DEMO_PROFILES: Record<UserRole, UserProfile> = {
  donor: {
    uid: "demo-donor",
    email: "demo-donor@annsetu.org",
    name: "Green Cafe",
    role: "donor",
    phone: "+91 9876543210",
    location: { lat: 12.9716, lng: 77.5946 },
  },
  ngo: {
    uid: "demo-ngo",
    email: "demo-ngo@annsetu.org",
    name: "Hope Foundation",
    role: "ngo",
    phone: "+91 9876543211",
    location: { lat: 12.9352, lng: 77.6245 },
  },
  volunteer: {
    uid: "demo-volunteer",
    email: "demo-volunteer@annsetu.org",
    name: "Rahul Kumar",
    role: "volunteer",
    phone: "+91 9876543212",
    location: { lat: 12.9500, lng: 77.6000 },
  },
  admin: {
    uid: "demo-admin",
    email: "demo-admin@annsetu.org",
    name: "Admin User",
    role: "admin",
    phone: "+91 9876543200",
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Don't override if we're using a demo account
      if (userProfile?.uid?.startsWith("demo-")) return;

      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          }
        } catch (e) {
          console.error("Error fetching user profile", e);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile?.uid]);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole, phone?: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newProfile: UserProfile = {
      uid: userCredential.user.uid,
      email,
      name,
      role,
      phone,
    };
    await setDoc(doc(db, "users", userCredential.user.uid), newProfile);
    setUserProfile(newProfile);
  };

  const signOut = async () => {
    if (userProfile?.uid?.startsWith("demo-")) {
      setUser(null);
      setUserProfile(null);
      return;
    }
    await firebaseSignOut(auth);
    setUserProfile(null);
  };

  const demoLogin = (role: UserRole) => {
    const profile = DEMO_PROFILES[role];
    setUserProfile(profile);
    setUser({ uid: profile.uid, email: profile.email } as User);
    setLoading(false);

    // Seed demo user doc in Firestore so all queries (donations, requests, deliveries) work
    // This is fire-and-forget — non-blocking
    setDoc(doc(db, "users", profile.uid), profile, { merge: true }).catch((err) =>
      console.warn("Could not seed demo user doc:", err)
    );
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signIn, signUp, signOut, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
