import type { Metadata } from "next";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { headers } from "next/headers";

import { AppShell } from "@/components/app-shell";

import "./globals.css";
import { Providers } from "./providers";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OnchainSuite Admin",
  description: "Internal monitoring console.",
  robots: { index: false, follow: false },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Identity verified by src/middleware.ts (Cloudflare Access JWT) and forwarded
  // as x-admin-email — no re-verification needed here.
  const email = (await headers()).get("x-admin-email") ?? "unknown";

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${instrumentSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <AppShell email={email}>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
