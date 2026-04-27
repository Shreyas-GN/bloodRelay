import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { AuthProvider } from '@/context/AuthContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Pulse Aid - Emergency Blood, Handled Calmly",
  description: "Bridging the gap between donors and those in need. Simple, fast, and trusted.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#C0392B',
          colorBackground: '#ffffff',
          colorText: '#18181B',
          colorDanger: '#E74C3C',
          fontFamily: 'var(--font-geist-sans), sans-serif',
          borderRadius: '16px'
        },
        elements: {
          card: 'shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#F4F4F5]',
          formButtonPrimary: 'shadow-[0_4px_14px_rgba(192,57,43,0.3)] hover:-translate-y-px transition-all',
          formFieldInput: 'border-[#E4E4E7] shadow-[0_2px_12px_rgba(0,0,0,0.03)] focus:border-[#C0392B] focus:ring-[#C0392B]'
        }
      }}
    >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${spaceMono.variable} antialiased font-sans`}
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
