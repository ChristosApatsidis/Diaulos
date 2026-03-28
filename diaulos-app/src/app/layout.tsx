// app/layout.tsx
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { siteConfig } from "@/config/site";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import LayoutClient from "./layout-client";

export const metadata: Metadata = {
  title: `${siteConfig.name}`,
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  const cookieStore = await cookies();
  const theme = (cookieStore.get("theme")?.value ?? "light") as
    | "light"
    | "dark";

  return (
    <html lang="en" className={theme} data-theme={theme}>
      <body
        className="min-h-screen text-foreground bg-background antialiased"
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <LayoutClient>{children}</LayoutClient>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
