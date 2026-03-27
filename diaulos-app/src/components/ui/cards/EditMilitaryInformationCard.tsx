// components/ui/cards/EditProfileCard.tsx
"use client";

import { FieldError, Form, TextField, Input, Label } from "@heroui/react";
import { useTranslations } from "next-intl";
import { InfoCard } from "@/components/ui/cards/InfoCard";

type EditProfileForm = {
  name: string;
  username: string;
  email: string;
  specialization: string;
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
    specialization?: string;
    general?: string;
  };
  setErrors: React.Dispatch<
    React.SetStateAction<{
      specialization?: string;
      general?: string;
    }>
  >;
}) {
  const generalTranslations = useTranslations("general");
  const militaryInfoTranslations = useTranslations(
    "component_ui_cards_editMilitaryInformation",
  );

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
        </Form>
      </InfoCard.Body>
    </InfoCard>
  );
}
