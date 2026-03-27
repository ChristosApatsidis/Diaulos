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
import React, { useRef } from "react";
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
  const editProfileTranslations = useTranslations("page_editProfile");

  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    specialization: "",
  });
  const [errors, setErrors] = useState<{
    name?: string;
    username?: string;
    email?: string;
    specialization?: string;
    general?: string;
  }>({});

  // Pre-fill form with session data
  useEffect(() => {
    if (session?.user) {
      const user = session.user as any;
      setFormData({
        name: user.name ?? "",
        username: user.username ?? "",
        email: user.email ?? "",
        specialization: user.specialization ?? "",
      });
    }
  }, [session]);

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    setErrors({});

    try {
      const { error } = await authClient.updateUser({
        specialization: formData.specialization,
      });

      if (error) {
        setErrors({ general: error.message });
      } else {
        // Set a flag in sessionStorage to show the success toast on the profile page
        sessionStorage.setItem("profileUpdated", "true");
        router.push("/profile");
      }
    } catch (err) {
      setErrors({ general: (err as Error).message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="container mx-auto px-4 pt-2 pb-4 flex flex-col">
      <div className="grid lg:grid-cols-2 gap-2 items-start">
        <EditPersonalInformationCard
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          setErrors={setErrors}
        />
        <EditMilitaryInformationCard
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          setErrors={setErrors}
        />
        <div className="col-span-full flex justify-end gap-2">
          <Button
            variant="tertiary"
            onPress={() => router.push("/profile")}
            isDisabled={isSaving}
          >
            {editProfileTranslations("buttons.cancel")}
          </Button>
          <Button onPress={handleSave} isDisabled={isSaving}>
            {isSaving
              ? editProfileTranslations("buttons.saving")
              : editProfileTranslations("buttons.save")}
          </Button>
        </div>
      </div>
    </main>
  );
}
