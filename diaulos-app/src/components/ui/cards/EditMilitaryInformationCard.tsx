// components/ui/cards/EditProfileCard.tsx
"use client";

import {
  FieldError,
  Form,
  Input,
  Label,
  ListBox,
  Select,
  TextField,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { InfoCard } from "@/components/ui/cards/InfoCard";
import { authClient } from "@/lib/better-auth/auth-client";
import { hellenicArmedForcesConfig } from "@/config/hellenic-armed-forces";

type EditProfileForm = {
  name: string;
  username: string;
  email: string;
  specialization: string;
  rank: string;
};

/**
 * EditMilitaryInformationCard is a form component that allows users to edit their military information such as specialization.
 * It handles form state, validation errors, and integrates with the authClient to update the user's specialization.
 * @param formData - The current state of the form data.
 * @param setFormData - A function to update the form data state.
 * @param errors - An object containing validation error messages for each form field.
 * @param setErrors - A function to update the errors state.
 * @returns A React component that renders the military information edit form.
 */
export default function EditMilitaryInformationCard({
  formData,
  setFormData,
  errors,
  setErrors,
}: {
  formData: EditProfileForm;
  setFormData: React.Dispatch<React.SetStateAction<EditProfileForm>>;
  errors: {
    rank?: string;
    specialization?: string;
    general?: string;
  };
  setErrors: React.Dispatch<
    React.SetStateAction<{
      rank?: string;
      specialization?: string;
      general?: string;
    }>
  >;
}) {
  const { data: session } = authClient.useSession();
  const generalTranslations = useTranslations("general");
  const militaryInfoTranslations = useTranslations(
    "component_ui_cards_editMilitaryInformation",
  );

  const ranks: Record<
    string,
    Record<string, string>
  > = hellenicArmedForcesConfig.ranks;

  return (
    <InfoCard className="h-full">
      <InfoCard.Header>
        <InfoCard.Header.Title>
          {militaryInfoTranslations("title")}
        </InfoCard.Header.Title>
      </InfoCard.Header>
      <InfoCard.Body>
        <Form className="space-y-4">
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
          <div>
            <Select
              variant="secondary"
              name="rank"
              isInvalid={!!errors.rank}
              value={formData.rank}
              onChange={(value) => {
                setFormData({
                  ...formData,
                  rank: value as string,
                });
                setErrors({ ...errors, rank: "" }); // Clear rank error on change
              }}
            >
              <Label>{militaryInfoTranslations("form.labels.rank")}</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {Object.entries(ranks[session?.user?.branch || ""] || {}).map(
                    ([rankKey, rankName]) => (
                      <ListBox.Item
                        key={rankKey}
                        id={rankKey}
                        textValue={rankName}
                      >
                        {generalTranslations(
                          `ranks.${session?.user?.branch}.${rankKey}`,
                        ) || rankName}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ),
                  )}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>
        </Form>
      </InfoCard.Body>
    </InfoCard>
  );
}
