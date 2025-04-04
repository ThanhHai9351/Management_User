"use client"
import { SessionProvider } from "next-auth/react";
import React from "react";

export default function NextAuthWrapper({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
            {children}
        </SessionProvider>
    )
}