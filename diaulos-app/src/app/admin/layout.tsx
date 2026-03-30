// admin/layout.tsx
import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import AdminMenu from "@/components/layout/AdminMenu";

export const metadata: Metadata = {
  title: `${siteConfig.name} - Admin`,
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row h-full">
      <AdminMenu />
      <main className="md:flex-1 md:overflow-auto">{children}</main>
    </div>
  );
}
