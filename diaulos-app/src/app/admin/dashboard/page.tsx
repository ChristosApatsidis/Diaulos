// admin/dashboard/page.tsx
"use client";

import { useTranslations } from "next-intl";
import AccountInformationCard from "@/components/ui/cards/AccountInformation";
import MilitaryInformationCard from "@/components/ui/cards/MilitaryInformation";
import PersonalInfoCard from "@/components/ui/cards/PersonalInfoCard";

export default function AdminDashboardPage() {
  const _generalTranslations = useTranslations("general");
  const _adminPageTranslations = useTranslations("page_admin");

  return (
    <main className="container mx-auto px-4 py-4 pb-4 flex flex-col gap-2">
      <h1>Admin Dashboard</h1>
      <PersonalInfoCard />
      <MilitaryInformationCard />
      <AccountInformationCard />
    </main>
  );
}
