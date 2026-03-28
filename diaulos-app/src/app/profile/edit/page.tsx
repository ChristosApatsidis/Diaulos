// profile/edit/page.tsx
"use client";

import { authClient } from "@/lib/better-auth/auth-client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Alert, Button } from "@heroui/react";
import { useEffect, useState } from "react";
import ProfileBannerCard from "@/components/ui/cards/ProfileBannerCard";
import EditPersonalInformationCard from "@/components/ui/cards/EditPersonalInformationCard";
import EditMilitaryInformationCard from "@/components/ui/cards/EditMilitaryInformationCard";
import { Save } from "lucide-react";

export default function EditProfilePage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const generalTranslations = useTranslations("general");
  const editProfileTranslations = useTranslations("page_editProfile");

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    rank: "",
    specialization: "",
  });
  const [errors, setErrors] = useState<{
    name?: string;
    username?: string;
    email?: string;
    rank?: string;
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
        rank: user.rank ?? "",
        specialization: user.specialization ?? "",
      });
    }
  }, [session]);

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

  // Handle save
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
      const { error } = await authClient.updateUser({
        name: formData.name,
        username: formData.username,
        rank: formData.rank,
        specialization: formData.specialization,
      });

      if (error) {
        setErrors({ general: error.message });
      } else {
        // Set a flag in sessionStorage to show the success toast on the profile page
        sessionStorage.setItem("profileUpdated", "true");
        router.push("/profile");
      }
    } catch (err: any) {
      setErrors({ general: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="container mx-auto px-4 pt-2 pb-4 flex flex-col gap-2">
      {errors.general && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>
              {generalTranslations("alerts.networkError.title")}
            </Alert.Title>
            <Alert.Description>
              {generalTranslations("alerts.networkError.description")}
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                <li>
                  {generalTranslations(
                    "alerts.networkError.suggestions.checkConnection",
                  )}
                </li>
                <li>
                  {generalTranslations(
                    "alerts.networkError.suggestions.refreshPage",
                  )}
                </li>
                <li>
                  {generalTranslations(
                    "alerts.networkError.suggestions.clearBrowserData",
                  )}
                </li>
              </ul>
            </Alert.Description>
          </Alert.Content>
        </Alert>
      )}
      <ProfileBannerCard updatePasswordButton />
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
            <Save size={16} />
            {isSaving
              ? editProfileTranslations("buttons.saving")
              : editProfileTranslations("buttons.save")}
          </Button>
        </div>
      </div>
    </main>
  );
}
