
import './globals.css'
import type { Metadata } from "next";
import {
  ClerkProvider,
} from '@clerk/nextjs'
import {Inter } from "next/font/google";
import Header from "@/components/header";
import { ThemeProvider}   from "@/components/theme-provider"
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Penyy",
  description: "Track your expenses and income even a penny",
  icons: {
    icon: [
      { url: '/logo-light.jpeg', sizes: '32x32', type: 'image/jpeg' },
      { url: '/logo-light.jpeg', sizes: '16x16', type: 'image/jpeg' },
    ],
    shortcut: '/logo-light.jpeg',
    apple: [
      { url: '/logo-light.jpeg', sizes: '180x180', type: 'image/jpeg' },
    ],
    other: [
      {
        rel: 'icon',
        url: '/logo-light.jpeg',
      },
    ],
  },
  manifest: '/manifest.json',
  themeColor: '#0079fa',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.className}`}
          suppressHydrationWarning
        >
          <ThemeProvider>
            {/* Header */}
            <Header />
            <main className="min-h-screen">
              {children}
            </main>
            <Toaster richColors />
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
