
import './globals.css'
import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import {Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ThemeProvider}   from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Penyy",
  description: "Track your expenses and income even a penny",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
<html lang="en">
      <body
        className={`${inter.className} `}>
          <ThemeProvider>
          {/* Header */}
          <Header />
          <main className="min-h-screen">
        {children}
        </main>
        {/* Footer */}
        <footer className="bg-blue-50 py-12">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Pennie. All rights reserved. Made with ❤️ by <a href="https://github.com/Sanchay22" className="text-blue-500 hover:underline">Sanchay</a>
          </p>
        </footer>
        </ThemeProvider>
      </body>
    </html>
    </ClerkProvider>
    
  );
}
