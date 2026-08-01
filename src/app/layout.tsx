import type { Metadata } from "next";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";

import { AppShell } from "@/components/app-shell";
import { SignOut } from "@/components/sign-out";
import { getIdentity } from "@/lib/identity";

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
  icons: {
    icon: "https://res.cloudinary.com/dwnkqkx8q/image/upload/v1761094220/onchain_light_wylceb.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const identity = await getIdentity();
  const signedIn = identity.user !== "unknown";

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${instrumentSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {signedIn ? (
            <AppShell user={identity.user} signOut={<SignOut />}>
              {children}
            </AppShell>
          ) : (
            // Not signed in (e.g. /signin) — render bare, no shell.
            children
          )}
        </Providers>
      </body>
    </html>
  );
}
