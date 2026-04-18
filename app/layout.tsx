import type { Metadata, Viewport } from "next";
import { DM_Sans, JetBrains_Mono, Orbitron } from "next/font/google";

import AppProviders from "@/components/providers/AppProviders";

import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["700", "800", "900"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "700"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "600"],
});

const metadataBaseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXTAUTH_URL ??
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(metadataBaseUrl),
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${orbitron.variable} ${dmSans.variable} ${jetBrainsMono.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
