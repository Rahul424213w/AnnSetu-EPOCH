"use client";

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
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
  created_at?: Date;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
  demoLogin: (role: UserRole) => void;
  signInWithGoogle: () => Promise<void>;
  error: string | null;
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
  const [error, setError] = useState<string | null>(null);
  const userProfileRef = useRef<UserProfile | null>(null);

  // Keep ref in sync with state to avoid stale closures in listeners
  useEffect(() => {
    userProfileRef.current = userProfile;
  }, [userProfile]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      // Don't override if we're using a demo account (checked via ref)
      if (userProfileRef.current?.uid?.startsWith("demo-")) {
        setLoading(false);
        return;
      }

      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const profile = userDoc.data() as UserProfile;
            setUserProfile(profile);
          } else {
            console.warn("User logged in but no profile found in Firestore");
            setUserProfile(null);
          }
        } catch (e) {
          console.error("Error fetching user profile", e);
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Failed to sign in");
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      if (!userDoc.exists()) {
        const newProfile: UserProfile = {
          uid: result.user.uid,
          email: result.user.email || "",
          name: result.user.displayName || "Google User",
          role: "donor", // Defaulting to donor for Google sign-in
          created_at: new Date(),
        };
        await setDoc(doc(db, "users", result.user.uid), newProfile);
        setUserProfile(newProfile);
      } else {
        setUserProfile(userDoc.data() as UserProfile);
      }
    } catch (err: any) {
      setLoading(false);
      if (err?.code !== "auth/popup-closed-by-user" && err?.code !== "auth/cancelled-popup-request") {
        setError(err.message || "Failed to sign in with Google");
      }
      throw err;
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole, phone?: string) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newProfile: UserProfile = {
        uid: userCredential.user.uid,
        email,
        name,
        role,
        phone,
        created_at: new Date(),
      };
      await setDoc(doc(db, "users", userCredential.user.uid), newProfile);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Failed to register");
      throw err;
    }
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
    userProfileRef.current = profile;
    setUserProfile(profile);
    setUser({ uid: profile.uid, email: profile.email } as User);
    setLoading(false);

    // Seed demo user doc in Firestore so all queries work
    setDoc(doc(db, "users", profile.uid), profile, { merge: true }).catch((err) =>
      console.warn("Could not seed demo user doc:", err)
    );
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, error, signIn, signUp, signOut, demoLogin, signInWithGoogle }}>
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
