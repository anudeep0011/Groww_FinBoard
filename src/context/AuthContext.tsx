"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
    User,
    onAuthStateChanged,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile,
    AuthError
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    googleSignIn: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Helper to check if route is public
const PUBLIC_ROUTES = ["/login", "/signup"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);

            // Simple Client-Side Route Protection
            const isPublic = PUBLIC_ROUTES.includes(pathname);

            if (!currentUser && !isPublic) {
                router.push("/login"); // Redirect to login if not authenticated
            } else if (currentUser && isPublic) {
                router.push("/"); // Redirect to dashboard if trying to access auth pages while logged in
            }
        });

        return () => unsubscribe();
    }, [pathname, router]);

    const googleSignIn = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            // Router redirect handled by useEffect
        } catch (error) {
            console.error("Google Sign In Error:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            // Router redirect handled by useEffect
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, googleSignIn, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
