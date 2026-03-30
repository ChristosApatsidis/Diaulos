// admin/dashboard/page.tsx
"use client";

import { useTranslations } from "next-intl";
import { toast } from "@heroui/react";
import { useEffect } from "react";
import ProfileBannerCard from "@/components/ui/cards/ProfileBannerCard";
import PersonalInfoCard from "@/components/ui/cards/PersonalInfoCard";
import MilitaryInformationCard from "@/components/ui/cards/MilitaryInformation";
import AccountInformationCard from "@/components/ui/cards/AccountInformation";

export default function AdminDashboardPage() {
  const generalTranslations = useTranslations("general");
  const adminPageTranslations = useTranslations("page_admin");

  return (
    <main className="container mx-auto px-4 py-4 pb-4 flex flex-col gap-2">
      <h1>Admin Dashboard</h1>
      <PersonalInfoCard />
      <MilitaryInformationCard />
      <AccountInformationCard />
    </main>
  );
}
