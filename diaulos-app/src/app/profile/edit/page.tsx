// profile/edit/page.tsx
"use client";

import { Card } from "@heroui/react";
import { Logo } from "@/components/icons";
import { authClient } from "@/lib/better-auth/auth-client";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast, Button, Surface, Separator, Avatar } from "@heroui/react";
import { useEffect, useState } from "react";
import useSWR from "swr";
import EditPersonalInformationCard from "@/components/ui/cards/EditPersonalInformationCard";
import EditMilitaryInformationCard from "@/components/ui/cards/EditMilitaryInformationCard";

export default function EditProfilePage() {
  const locale = useLocale();
  const router = useRouter();
  const {
    data: session,
    isPending: sessionIsPending,
    error: sessionError,
  } = authClient.useSession();
  const generalTranslations = useTranslations("general");

  return (
    <main className="container mx-auto px-4 pt-2 pb-4 flex flex-col gap-2">
      {/* Personal & Military Info */}
      <div className="grid lg:grid-cols-2 gap-2 items-start">
        <EditPersonalInformationCard />
        <EditMilitaryInformationCard />
      </div>
    </main>
  );
}
