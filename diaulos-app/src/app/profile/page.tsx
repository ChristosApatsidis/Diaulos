// profile/page.tsx
"use client";

import { useEffect } from "react";
import { toast } from "@heroui/react";
import { useTranslations } from "next-intl";
import AccountInformationCard from "@/components/ui/cards/AccountInformation";
import MilitaryInformationCard from "@/components/ui/cards/MilitaryInformation";
import PersonalInfoCard from "@/components/ui/cards/PersonalInfoCard";
import ProfileBannerCard from "@/components/ui/cards/ProfileBannerCard";

export default function ProfilePage() {
  const profileTranslations = useTranslations("page_profile");

  // Check for profile update flag in sessionStorage and show toast if set
  useEffect(() => {
    if (sessionStorage.getItem("profileUpdated") === "true") {
      // Clear the flag so the toast only shows once
      sessionStorage.removeItem("profileUpdated");

      // Show success toast
      toast.success(profileTranslations("toast.updateSuccess.title"), {
        description: profileTranslations("toast.updateSuccess.description"),
      });
    }
  }, [profileTranslations]);

  return (
    <main className="container mx-auto px-4 pt-2 pb-4 flex flex-col gap-2">
      {/* Profile Banner */}
      <ProfileBannerCard editProfileButton />
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
