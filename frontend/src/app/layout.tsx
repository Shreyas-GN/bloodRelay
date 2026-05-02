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
  title: {
    default: "PulseAid | Emergency Blood Coordination Platform",
    template: "%s | PulseAid"
  },
  description: "PulseAid connects blood donors with families in urgent need within seconds. No delays, no middlemen—just direct, life-saving coordination.",
  keywords: ["blood donation", "emergency blood", "find blood donor", "blood bank", "emergency coordination", "donate blood"],
  authors: [{ name: "PulseAid Team" }],
  metadataBase: new URL("https://pulse-aid.netlify.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "PulseAid | Emergency Blood Coordination",
    description: "Bridging the gap between donors and those in need. Fast, trusted, and free.",
    url: "https://pulse-aid.netlify.app",
    siteName: "PulseAid",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PulseAid - Emergency Blood Coordination",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PulseAid | Find Blood Donors Near You",
    description: "Connect with matching blood donors in seconds during emergencies.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EmergencyService",
  "name": "PulseAid",
  "url": "https://pulse-aid.netlify.app",
  "logo": "https://pulse-aid.netlify.app/logo.png",
  "description": "Connecting blood donors with recipients in real-time emergency situations.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Bangalore",
    "addressCountry": "IN"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Emergency Blood Support",
    "url": "https://pulse-aid.netlify.app/emergency"
  }
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
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
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
