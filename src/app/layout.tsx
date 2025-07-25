import type { Metadata } from "next";
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
  description: "Sua inteligencia artificial para recrutamento",
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
