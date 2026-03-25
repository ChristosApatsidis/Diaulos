// profile/page.tsx
"use client";

import { useTranslations } from "next-intl";
import { toast } from "@heroui/react";
import { useEffect } from "react";
import ProfileBannerCard from "@/components/ui/cards/ProfileBannerCard";
import PersonalInfoCard from "@/components/ui/cards/PersonalInfoCard";
import MilitaryInformationCard from "@/components/ui/cards/MilitaryInformation";
import AccountInformationCard from "@/components/ui/cards/AccountInformation";

export default function ProfilePage() {
  const profileInfoTranslations = useTranslations(
    "component_ui_cards_profileInfo",
  );

  // Check for profile update flag in sessionStorage and show toast if set
  useEffect(() => {
    if (sessionStorage.getItem("profileUpdated") === "true") {
      // Clear the flag so the toast only shows once
      sessionStorage.removeItem("profileUpdated");

      // Show success toast
      toast.success(profileInfoTranslations("toast.updateSuccess.title"), {
        description: profileInfoTranslations("toast.updateSuccess.description"),
      });
    }
  }, []);

  return (
    <main className="container mx-auto px-4 pt-2 pb-4 flex flex-col gap-2">
      {/* Profile Banner */}
      <ProfileBannerCard />
      {/* Personal & Military Info */}
      <div className="grid lg:grid-cols-2 gap-2 items-start">
        <PersonalInfoCard />
        <MilitaryInformationCard />
      </div>
      {/* Account Info */}
      <AccountInformationCard />
    </main>
  );
}
