// components/ui/cards/EditProfileCard.tsx
"use client";

import { useState } from "react";
import {
  toast,
  Button,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/better-auth/auth-client";
import { InfoCard } from "@/components/ui/cards/InfoCard";

type EditProfileForm = {
  name: string;
  username: string;
  email: string;
  specialization: string;
  rank: string;
};

/**
 * EditPersonalInformationCard is a form component that allows users to edit their personal information such as name, username, and email.
 * It handles form state, validation errors, and integrates with the authClient to update the user's email.
 * @param formData - The current state of the form data.
 * @param setFormData - A function to update the form data state.
 * @param errors - An object containing validation error messages for each form field.
 * @param setErrors - A function to update the errors state.
 * @returns A React component that renders the personal information edit form.
 */
export default function EditPersonalInformationCard({
  formData,
  setFormData,
  errors,
  setErrors,
}: {
  formData: EditProfileForm;
  setFormData: React.Dispatch<React.SetStateAction<EditProfileForm>>;
  errors: {
    name?: string;
    username?: string;
    email?: string;
    general?: string;
  };
  setErrors: React.Dispatch<
    React.SetStateAction<{
      name?: string;
      username?: string;
      email?: string;
      general?: string;
    }>
  >;
}) {
  const { data: session } = authClient.useSession();
  const editPersonalInformationTranslations = useTranslations(
    "component_ui_cards_editPersonalInformation",
  );

  const [loadingChangeEmail, setLoadingChangeEmail] = useState<boolean>(false);

  // Change email handler
  const handleChangeEmail = async () => {
    // Check if email is actually changed before making API call
    if (formData.email === session?.user?.email) return;

    setLoadingChangeEmail(true);

    try {
      const { error } = await authClient.changeEmail({
        newEmail: formData.email,
      });

      if (error) {
        switch (error.code || error.message) {
          case "Email is the same":
            setErrors({
              email: "emailIsTheSame",
            });
            break;
          case "INVALID_EMAIL":
            setErrors({
              email: "invalidEmail",
            });
            break;
          case "VALIDATION_ERROR":
            setErrors({
              email: "invalidEmail",
            });
            break;
          case "Too many requests. Please try again later.":
            toast.danger(
              editPersonalInformationTranslations("toast.toManyRequests.title"),
              {
                description: editPersonalInformationTranslations(
                  "toast.toManyRequests.description",
                ),
              },
            );
            break;
          default:
            toast.danger(
              editPersonalInformationTranslations(
                "toast.changeEmailError.title",
              ),
              {
                description: editPersonalInformationTranslations(
                  "toast.changeEmailError.description",
                ),
              },
            );
            break;
        }
      } else {
        toast.success(
          editPersonalInformationTranslations("toast.changeEmailSuccess.title"),
          {
            description: editPersonalInformationTranslations(
              "toast.changeEmailSuccess.description",
            ),
          },
        );
      }
    } catch (err) {
      toast.danger(
        editPersonalInformationTranslations("toast.changeEmailError.title"),
        {
          description: editPersonalInformationTranslations(
            "toast.changeEmailError.description",
          ),
        },
      );
    } finally {
      setLoadingChangeEmail(false);
    }
  };

  return (
    <InfoCard className="h-full">
      <InfoCard.Header>
        <InfoCard.Header.Title>
          {editPersonalInformationTranslations("title")}
        </InfoCard.Header.Title>
      </InfoCard.Header>
      <InfoCard.Body>
        <Form className="space-y-4">
          {/* Name */}
          <div className="flex flex-col">
            <TextField
              variant="secondary"
              name="name"
              type="text"
              isInvalid={!!errors.name}
            >
              <Label>
                {editPersonalInformationTranslations("form.labels.name")}
              </Label>
              <Input
                placeholder={editPersonalInformationTranslations(
                  "form.placeholders.name",
                )}
                value={formData.name}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  });
                  setErrors({ ...errors, name: "" }); // Clear name error on change
                }}
              />
              <FieldError>{errors.name}</FieldError>
            </TextField>
          </div>
          {/* Username */}
          <div className="flex flex-col">
            <TextField
              variant="secondary"
              name="username"
              type="text"
              isInvalid={!!errors.username}
            >
              <Label>
                {editPersonalInformationTranslations("form.labels.username")}
              </Label>
              <Input
                placeholder={editPersonalInformationTranslations(
                  "form.placeholders.username",
                )}
                value={formData.username}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    username: e.target.value,
                  });
                  setErrors({ ...errors, username: "" }); // Clear username error on change
                }}
              />
              <FieldError>{errors.username}</FieldError>
            </TextField>
          </div>
          {/* Email */}
          <div
            className={`flex ${errors.email ? "items-center" : "items-end"} gap-2`}
          >
            <TextField
              variant="secondary"
              name="email"
              type="email"
              isInvalid={!!errors.email}
              className="flex-1"
            >
              <Label>
                {editPersonalInformationTranslations("form.labels.email")}
              </Label>
              <Input
                placeholder={editPersonalInformationTranslations(
                  "form.placeholders.email",
                )}
                value={formData.email}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  });
                  setErrors({ ...errors, email: "" }); // Clear email error on change
                }}
              />
              <FieldError>
                {errors.email &&
                  editPersonalInformationTranslations(`errors.${errors.email}`)}
              </FieldError>
            </TextField>
            <Button
              onPress={handleChangeEmail}
              isDisabled={
                loadingChangeEmail ||
                !formData.email ||
                formData.email === session?.user?.email
              }
            >
              {editPersonalInformationTranslations("form.buttons.updateEmail")}
            </Button>
          </div>
        </Form>
      </InfoCard.Body>
    </InfoCard>
  );
}
