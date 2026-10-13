import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { VoiceOrbProvider } from "@/components/voice/voice-orb";
import "./globals.css";

const sans = Inter({ variable: "--font-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Deecide",
  description: "Make better decisions with structure and clarity",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Deecide",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon-192.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#735cf6",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // JDS is designed dark first
    <html lang="en" className={cn("dark", sans.variable)}>
      <body>
        <VoiceOrbProvider variant="ring">{children}</VoiceOrbProvider>
      </body>
    </html>
  );
}
