// profile/edit/layout.tsx
import { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `${siteConfig.name} - Profile Edit`,
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export default function ProfileEditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
