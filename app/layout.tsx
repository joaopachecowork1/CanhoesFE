import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces, JetBrains_Mono, Orbitron } from "next/font/google";

import AppProviders from "@/components/providers/AppProviders";

import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "700"],
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "600"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Canh\u00f5es do Ano",
  description: "O ritual anual dos Canh\u00f5es: feed, vota\u00e7\u00f5es, nomea\u00e7\u00f5es e gala.",
  icons: {
    icon: "/brand/icon.svg",
    apple: "/brand/icon.svg",
    shortcut: "/brand/icon.svg",
  },
  openGraph: {
    title: "Canhoes do Ano",
    description: "Premiando a comunidade com uma experiencia clara, moderna e memoravel.",
    images: ["/brand/hero.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Canhoes do Ano",
    description: "Premiando a comunidade com uma experiencia clara, moderna e memoravel.",
    images: ["/brand/hero.svg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body
        className={`${orbitron.variable} ${dmSans.variable} ${jetBrainsMono.variable} ${fraunces.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
