import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Space_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { AuthProvider } from '@/context/AuthContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BloodRelay | Emergency Blood Coordination Platform",
    template: "%s | BloodRelay"
  },
  description: "BloodRelay connects blood donors with families in urgent need within seconds. No delays, no middlemen—just direct, life-saving coordination.",
  keywords: ["blood donation", "emergency blood", "find blood donor", "blood bank", "emergency coordination", "donate blood"],
  authors: [{ name: "BloodRelay Team" }],
  metadataBase: new URL("https://bloodrelay.netlify.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "BloodRelay | Emergency Blood Coordination",
    description: "Bridging the gap between donors and those in need. Fast, trusted, and free.",
    url: "https://bloodrelay.netlify.app",
    siteName: "BloodRelay",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BloodRelay - Emergency Blood Coordination",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BloodRelay | Find Blood Donors Near You",
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
  "name": "BloodRelay",
  "url": "https://bloodrelay.netlify.app",
  "logo": "https://bloodrelay.netlify.app/logo.png",
  "description": "Connecting blood donors with recipients in real-time emergency situations.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Bangalore",
    "addressCountry": "IN"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Emergency Blood Support",
    "url": "https://bloodrelay.netlify.app/emergency"
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
          colorPrimary: '#B91C1C',
          colorBackground: '#FCFCFB',
          colorText: '#18181B',
          colorDanger: '#DC2626',
          fontFamily: 'var(--font-inter), var(--font-geist-sans), sans-serif',
          borderRadius: '16px'
        },
        elements: {
          card: 'shadow-[0_8px_30px_rgba(0,0,0,0.05)] border border-[#E4E4E7]',
          formButtonPrimary: 'shadow-[0_4px_14px_rgba(185,28,28,0.25)] hover:scale-[1.01] transition-all',
          formFieldInput: 'border-[#E4E4E7] shadow-[0_2px_12px_rgba(0,0,0,0.03)] focus:border-[#B91C1C] focus:ring-[#B91C1C]'
        }
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            suppressHydrationWarning
          />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${spaceMono.variable} antialiased`}
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
