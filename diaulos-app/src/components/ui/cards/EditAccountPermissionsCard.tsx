// components/ui/modals/EditUserDetails.tsx
"use client";

import { Checkbox, Description, Label } from "@heroui/react";
import { useTranslations } from "next-intl";
import { InfoCard } from "./InfoCard";

type EditProfileForm = {
  name: string;
  username: string;
  email: string;
  specialization: string;
  rank: string;
  branch?: string;
  combatArmsSupportBranch?: string;
  unitOfService?: string;
  role?: string;
  permissions?: string[];
};

export default function EditAccountPermissionsCard({
  formData,
  setFormData,
  errors,
  setErrors,
}: {
  formData: EditProfileForm;
  setFormData: React.Dispatch<React.SetStateAction<EditProfileForm>>;
  errors: {
    role?: string;
    permissions?: string;
    general?: string;
  };
  setErrors: React.Dispatch<
    React.SetStateAction<{
      role?: string;
      permissions?: string;
      general?: string;
    }>
  >;
}) {
  const accountPermissionsTranslations = useTranslations(
    "component_ui_cards_editAccountPermissions",
  );

  const permissionGroups = [
    {
      label: "View",
      permissions: [
        {
          key: "View content",
          label: "View content",
          description: "Can view data",
        },
      ],
    },
    {
      label: "Create",
      permissions: [
        {
          key: "Create content",
          label: "Create content",
          description: "Can create data",
        },
      ],
    },
    {
      label: "Edit",
      permissions: [
        {
          key: "Edit content",
          label: "Edit content",
          description: "Full administrative rights",
        },
        {
          key: "Edit own content",
          label: "Edit own content",
          description: "Can edit their own data",
        },
      ],
    },
    {
      label: "Delete",
      permissions: [
        {
          key: "Delete content",
          label: "Delete content",
          description: "Can delete data",
        },
        {
          key: "Delete own content",
          label: "Delete own content",
          description: "Can delete their own data",
        },
      ],
    },
  ];

  // Handle permission checkbox changes
  const handlePermissionChange = (permissionKey: string, checked: boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      permissions: checked
        ? [...(prev.permissions || []), permissionKey]
        : (prev.permissions || []).filter((p: string) => p !== permissionKey),
    }));
    setErrors((prev) => ({ ...prev, permissions: "" }));
  };

  return (
    <InfoCard className="h-full">
      <InfoCard.Header>
        <InfoCard.Header.Title>
          {accountPermissionsTranslations("title")}
        </InfoCard.Header.Title>
      </InfoCard.Header>
      <InfoCard.Body>
        {permissionGroups.map((group) => (
          <div key={group.label} className="mb-2 flex flex-col">
            <div className="font-semibold mb-2">{group.label}</div>
            <div className="grid grid-cols-3 gap-2">
              {group.permissions.map((perm) => (
                <Checkbox
                  key={perm.key}
                  id={`perm-${perm.key}`}
                  variant="secondary"
                  isSelected={formData.permissions?.includes(perm.key) || false}
                  onChange={(checked) =>
                    handlePermissionChange(perm.key, !!checked)
                  }
                  className="max-w-max"
                >
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Content>
                    <Label htmlFor={`perm-${perm.key}`}>{perm.label}</Label>
                    <Description>{perm.description}</Description>
                  </Checkbox.Content>
                </Checkbox>
              ))}
            </div>
          </div>
        ))}
        {errors.permissions && (
          <div className="text-red-500 text-sm">{errors.permissions}</div>
        )}
      </InfoCard.Body>
    </InfoCard>
  );
}
