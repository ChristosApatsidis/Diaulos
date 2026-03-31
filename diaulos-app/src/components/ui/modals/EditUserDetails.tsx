// components/ui/modals/EditUserDetails.tsx
"use client";

import { Button, Modal, toast, useOverlayState } from "@heroui/react";
import { UserPen, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import EditPersonalInformationCard from "@/components/ui/cards/EditPersonalInformationCard";
import EditMilitaryInformationCard from "@/components/ui/cards/EditMilitaryInformationCard";
import EditAccountPermissionsCard from "@/components/ui/cards/EditAccountPermissionsCard";
import type { User } from "@/types";
import { useEffect, useState } from "react";

type EditProfileForm = {
  name: string;
  username: string;
  email: string;
  specialization: string;
  rank: string;
  // admin fields
  branch?: string;
  combatArmsSupportBranch?: string;
  unitOfService?: string;
  role?: string;
  permissions?: string[];
};

/**
 * EditUserDetailsModal is a modal component that allows editing detailed information about a user, including their personal info, military info, and account info. It uses the Modal component from HeroUI and is triggered by a button. The modal content is organized into cards for better readability.
 * @param user - The user object containing all the details to be displayed in the modal.
 * @returns A React component that renders a button to open the modal and the modal itself with user details.
 */
export default function EditUserDetailsModal({
  user,
  onUserUpdated,
}: {
  user: User;
  onUserUpdated?: () => void;
}) {
  const editUserDetailsTranslations = useTranslations(
    "component_ui_modals_editUserDetails",
  );
  const editProfileTranslations = useTranslations("page_editProfile");

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formData, setFormData] = useState<EditProfileForm>({
    name: "",
    username: "",
    email: "",
    rank: "",
    specialization: "",
    // admin fields
    branch: "",
    combatArmsSupportBranch: "",
    unitOfService: "",
    role: "",
    permissions: [] as string[],
  });
  const [errors, setErrors] = useState<{
    name?: string;
    username?: string;
    email?: string;
    rank?: string;
    specialization?: string;
    // admin fields
    branch?: string;
    combatArmsSupportBranch?: string;
    unitOfService?: string;
    role?: string;
    permissions?: string;
    general?: string;
  }>({});

  // Pre-fill form with user data when modal opens
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name ?? "",
        username: user.username ?? "",
        email: user.email ?? "",
        rank: user.rank ?? "",
        specialization: user.specialization ?? "",
        // admin fields
        branch: user.branch ?? "",
        combatArmsSupportBranch: user.combatArmsSupportBranch ?? "",
        unitOfService: user.unitOfService ?? "",
        role: user.role ?? "",
        permissions: user.permissions ?? [],
      });
    }
  }, [user]);

  const state = useOverlayState();

  // Define validation rules for form fields
  const editProfileValidationRules = {
    name: {
      required: editProfileTranslations("validation.nameRequired"),
      minLength: {
        value: 2,
        message: editProfileTranslations("validation.nameMinLength"),
      },
      maxLength: {
        value: 50,
        message: editProfileTranslations("validation.nameMaxLength"),
      },
    },
    username: {
      required: editProfileTranslations("validation.usernameRequired"),
      minLength: {
        value: 4,
        message: editProfileTranslations("validation.usernameMinLength"),
      },
      maxLength: {
        value: 20,
        message: editProfileTranslations("validation.usernameMaxLength"),
      },
    },
    email: {
      required: editProfileTranslations("validation.emailRequired"),
      pattern: {
        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        message: editProfileTranslations("validation.emailInvalid"),
      },
    },
    specialization: {
      required: editProfileTranslations("validation.specializationRequired"),
      minLength: {
        value: 2,
        message: editProfileTranslations("validation.specializationMinLength"),
      },
      maxLength: {
        value: 100,
        message: editProfileTranslations("validation.specializationMaxLength"),
      },
    },
  };

  // Validates form data and sets error messages if validation fails
  const formValidation = () => {
    const newErrors: typeof errors = {};

    // Name validation
    if (!formData.name) {
      newErrors.name = editProfileValidationRules.name.required;
    } else if (
      formData.name.length < editProfileValidationRules.name.minLength.value
    ) {
      newErrors.name = editProfileValidationRules.name.minLength.message;
    } else if (
      formData.name.length > editProfileValidationRules.name.maxLength.value
    ) {
      newErrors.name = editProfileValidationRules.name.maxLength.message;
    }

    // Username validation
    if (!formData.username) {
      newErrors.username = editProfileValidationRules.username.required;
    } else if (
      formData.username.length <
      editProfileValidationRules.username.minLength.value
    ) {
      newErrors.username =
        editProfileValidationRules.username.minLength.message;
    } else if (
      formData.username.length >
      editProfileValidationRules.username.maxLength.value
    ) {
      newErrors.username =
        editProfileValidationRules.username.maxLength.message;
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = editProfileValidationRules.email.required;
    } else if (
      !editProfileValidationRules.email.pattern.value.test(formData.email)
    ) {
      newErrors.email = editProfileValidationRules.email.pattern.message;
    }

    // Specialization validation
    if (!formData.specialization) {
      newErrors.specialization =
        editProfileValidationRules.specialization.required;
    } else if (
      formData.specialization.length <
      editProfileValidationRules.specialization.minLength.value
    ) {
      newErrors.specialization =
        editProfileValidationRules.specialization.minLength.message;
    } else if (
      formData.specialization.length >
      editProfileValidationRules.specialization.maxLength.value
    ) {
      newErrors.specialization =
        editProfileValidationRules.specialization.maxLength.message;
    }

    return newErrors;
  };

  const handleSave = async () => {
    // Clear previous errors
    setErrors({});

    // Validate form data before making the API call
    const validationErrors = formValidation();

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/admin/users-management/users/${user.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        setErrors((prev) => ({
          ...prev,
          email:
            data.code === "EMAIL_TAKEN"
              ? editUserDetailsTranslations("errors.emailIsTaken")
              : prev.email,
        }));
        return;
      }

      // Show success toast, close modal, and refresh users list
      toast.success(editUserDetailsTranslations("toast.updateSuccess.title"), {
        description: editUserDetailsTranslations(
          "toast.updateSuccess.description",
          { name: formData.name },
        ),
      });

      state.setOpen(false);
      onUserUpdated?.();
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        general:
          err?.response?.data?.message ||
          editUserDetailsTranslations("errors.updateFailed"),
      }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal>
      <Button
        variant="tertiary"
        className="bg-warning-soft border-warning/50 hover:bg-warning/20 focus:ring-warning/50 font-normal"
        size="sm"
        onPress={state.open}
      >
        <UserPen size={16} />
        {editUserDetailsTranslations("buttons.editDetails")}
      </Button>
      <Modal.Backdrop isOpen={state.isOpen} onOpenChange={state.setOpen}>
        <Modal.Container size="lg">
          <Modal.Dialog className="md:min-w-[700px] lg:min-w-[900px] xl:min-w-[1200px]">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Icon className="bg-warning-soft text-warning-soft-foreground">
                <UserPen size={20} />
              </Modal.Icon>
            </Modal.Header>
            <Modal.Body className="p-1 space-y-2">
              <div className="flex flex-col gap-2">
                {errors.general && (
                  <div className="p-2 bg-red-100 text-red-800 rounded">
                    {errors.general}
                  </div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  <EditPersonalInformationCard
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    setErrors={setErrors}
                    updateEmailButton={false}
                  />
                  <EditMilitaryInformationCard
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    setErrors={setErrors}
                  />
                </div>
                <EditAccountPermissionsCard
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  setErrors={setErrors}
                />
              </div>
            </Modal.Body>

            <Modal.Footer>
              <Button
                variant="tertiary"
                onPress={() => state.setOpen(false)}
                isDisabled={isSaving}
              >
                {editUserDetailsTranslations("buttons.cancel")}
              </Button>
              <Button onPress={handleSave} isDisabled={isSaving}>
                <Save size={16} />
                {isSaving
                  ? editUserDetailsTranslations("buttons.savingChanges")
                  : editUserDetailsTranslations("buttons.save")}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
