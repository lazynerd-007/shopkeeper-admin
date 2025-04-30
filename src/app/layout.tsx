import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "./layout.module.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Shopkeeper Admin",
  description: "Admin Panel to view shopkeeper merchants",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={styles.root}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${styles.body} ${styles.antialiased}`}
      >
        {children}
      </body>
    </html>
  );
}
