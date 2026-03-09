import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Garden Dante",
  description: "O app do jardineiro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${workSans.variable} font-display antialiased bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col`}
      >
        <main className="flex-1 overflow-y-auto pb-24">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
