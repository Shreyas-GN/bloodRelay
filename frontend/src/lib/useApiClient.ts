"use client";

import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/";

export function useApiClient() {
    const { getToken } = useAuth();

    const client = useMemo(() => {
        const instance = axios.create({
            baseURL: API_BASE_URL,
            headers: { "Content-Type": "application/json" },
        });

        instance.interceptors.request.use(async (config) => {
            const token = await getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        return instance;
    }, [getToken]);

    return client;
}
