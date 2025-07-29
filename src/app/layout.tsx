import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { ThemeProvider } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import SyncUserWithConvex from "@/components/providers/SyncUserWithConvex";
import { Toaster } from "@/components/ui/sonner";
import { ptBR } from '@clerk/localizations'
import { dark } from '@clerk/themes'
import { Navbar } from "@/components/navbar";


const geistSans = Plus_Jakarta_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SuperHire AI",
  description: "Sua inteligência artificial para recrutamento e seleção de talentos",
  keywords: ["recrutamento", "seleção", "inteligência artificial", "RH", "recursos humanos", "talentos", "contratação"],
  authors: [{ name: "SuperHire" }],
  creator: "SuperHire",
  publisher: "SuperHire",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
   appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ingressify"
  },
  robots: "index, follow",
  alternates: {
    canonical: "https://superhire-ai.vercel.app",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://superhire-ai.vercel.app",
    title: "SuperHire AI - Recrutamento Inteligente",
    description: "Revolucione seu processo de recrutamento com inteligência artificial",
    siteName: "SuperHire AI",
    images: [{
      url: "https://superhire-ai.vercel.app/mvp.jpg",
      width: 1200,
      height: 630,
      alt: "SuperHire AI - Recrutamento Inteligente"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SuperHire AI - Recrutamento Inteligente",
    description: "Revolucione seu processo de recrutamento com inteligência artificial",
    images: ["https://superhire-ai.vercel.app/mvp.jpg"],
    creator: "@superhire",
  },
  applicationName: "SuperHire AI",
  category: "Recrutamento e Seleção",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#000000" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} antialiased`}
      >
        <ConvexClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
          >
            <ClerkProvider localization={ptBR} appearance={{
              baseTheme: dark,
            }}>
              <SyncUserWithConvex />
              <Navbar />
              {children}
              <Toaster />
            </ClerkProvider>
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
