"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useApiClient } from "@/lib/useApiClient";
import type { User } from "@/types";

interface AuthContextValue {
    profile: User | null;
    isLoading: boolean;
    refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const api = useApiClient();
    const [profile, setProfile] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const res = await api.get<User>("users/profile/");
            setProfile(res.data);
        } catch {
            setProfile(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AuthContext.Provider value={{ profile, isLoading, refetch: fetchProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useProfile(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useProfile must be used within AuthProvider");
    return ctx;
}
