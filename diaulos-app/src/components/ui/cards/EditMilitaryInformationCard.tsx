// components/ui/cards/EditProfileCard.tsx
"use client";

import { useState, useEffect } from "react";
import {
  toast,
  Button,
  FieldError,
  Form,
  TextField,
  Input,
  Label,
  Surface,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/better-auth/auth-client";
import { InfoCard } from "@/components/ui/cards/InfoCard";
import useSWR from "swr";
import { useRouter } from "next/navigation";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type EditProfileForm = {
  specialization: string;
};

export default function EditMilitaryInformationCard() {
  const router = useRouter();
  const {
    data: session,
    isPending: sessionIsPending,
    error: sessionError,
  } = authClient.useSession();
  const generalTranslations = useTranslations("general");
  const militaryInfoTranslations = useTranslations(
    "component_ui_cards_editMilitaryInformation",
  );

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    specialization?: string;
    general?: string;
  }>({});
  const [formData, setFormData] = useState<EditProfileForm>({
    specialization: "",
  });

  // Pre-fill form with session data
  useEffect(() => {
    if (session?.user) {
      const user = session.user as any;
      setFormData({
        specialization: user.specialization ?? "",
      });
    }
  }, [session]);

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
    <InfoCard className="h-full">
      <InfoCard.Header>
        <InfoCard.Header.Title>
          {militaryInfoTranslations("title")}
        </InfoCard.Header.Title>
      </InfoCard.Header>
      <InfoCard.Body>
        {errors.general && (
          <div className="mb-4 text-sm text-danger">{errors.general}</div>
        )}
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-4"
        >
          <div>
            <div className="flex flex-col">
              <TextField
                variant="secondary"
                name="specialization"
                type="text"
                isInvalid={!!errors.specialization}
              >
                <Label>
                  {militaryInfoTranslations("form.labels.specialization")}
                </Label>
                <Input
                  placeholder={militaryInfoTranslations(
                    "form.placeholders.specialization",
                  )}
                  value={formData.specialization}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      specialization: e.target.value,
                    });
                    setErrors({ ...errors, specialization: "" }); // Clear specialization error on change
                  }}
                />
                <FieldError>{errors.specialization}</FieldError>
              </TextField>
            </div>
          </div>
        </Form>
      </InfoCard.Body>
    </InfoCard>
  );
}
