"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useUser } from "@clerk/nextjs";
import { DonorService } from "@/services/donor.service";
import type { User } from "@/types";

interface AuthContextValue {
    profile: User | null;
    isLoading: boolean;
    refetch: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
    const [profile, setProfile] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = async () => {
        if (!clerkUser?.id) {
            setProfile(null);
            setIsLoading(false);
            return;
        }

        try {
            const data = await DonorService.getProfile(clerkUser.id);
            setProfile(data as any);
        } catch (error) {
            console.error("Failed to fetch profile", error);
            setProfile(null);
        } finally {
            setIsLoading(false);
        }
    };

    const updateProfile = async (data: Partial<User>) => {
        if (!clerkUser?.id) return;
        try {
            await DonorService.updateProfile(clerkUser.id, data as any);
            await fetchProfile();
        } catch (error) {
            console.error("Failed to update profile", error);
            throw error;
        }
    };

    useEffect(() => {
        if (isClerkLoaded) {
            fetchProfile();
        }
    }, [isClerkLoaded, clerkUser?.id]);

    return (
        <AuthContext.Provider value={{ 
            profile, 
            isLoading: !isClerkLoaded || isLoading, 
            refetch: fetchProfile,
            updateProfile 
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useProfile(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useProfile must be used within AuthProvider");
    return ctx;
}
