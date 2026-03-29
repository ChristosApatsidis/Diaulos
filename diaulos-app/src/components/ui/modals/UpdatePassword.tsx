// components/ui/modals/UpdatePassword.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  Alert,
  Button,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
  useOverlayState,
  toast,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { KeyRound } from "lucide-react";
import { authClient } from "@/lib/better-auth/auth-client";

/**
 * UpdatePasswordModal is a modal component that allows users to update their password. It includes form validation and error handling for the password update process.
 * @returns A React component that renders a button to open the modal and the modal itself with the password update form.
 */
export function UpdatePasswordModal() {
  const generalTranslations = useTranslations("general");
  const updatePasswordTranslations = useTranslations(
    "component_ui_modals_updatePassword",
  );

  const state = useOverlayState();

  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
    general?: string;
  }>({});
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [updatePasswordLoading, setUpdatePasswordLoading] =
    useState<boolean>(false);

  // Clear form and errors when modal is closed
  useEffect(() => {
    if (!state.isOpen) {
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setErrors({});
    }
  }, [state.isOpen]);

  // Define validation rules for form fields
  const formValidationRules = {
    currentPassword: {
      required: updatePasswordTranslations(
        "validation.currentPasswordRequired",
      ),
    },
    newPassword: {
      required: updatePasswordTranslations("validation.newPasswordRequired"),
      minLength: {
        value: 4,
        message: updatePasswordTranslations("validation.newPasswordMinLength"),
      },
    },
    confirmNewPassword: {
      required: updatePasswordTranslations(
        "validation.confirmNewPasswordRequired",
      ),
    },
  };

  // Validates form data and sets error messages if validation fails
  const formValidation = () => {
    const newErrors: typeof errors = {};

    // Validate current password field
    if (!formData.currentPassword) {
      newErrors.currentPassword = formValidationRules.currentPassword.required;
    }

    // Validate new password field
    if (!formData.newPassword) {
      newErrors.newPassword = formValidationRules.newPassword.required;
    } else if (
      formData.newPassword.length <
      formValidationRules.newPassword.minLength.value
    ) {
      newErrors.newPassword = formValidationRules.newPassword.minLength.message;
    }

    // Validate confirm new password field
    if (!formData.confirmNewPassword) {
      newErrors.confirmNewPassword =
        formValidationRules.confirmNewPassword.required;
    } else if (formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = updatePasswordTranslations(
        "validation.passwordsDoNotMatch",
      );
    }

    return newErrors;
  };

  // Handles the password update process, including form validation and API call
  const handleUpdatePassword = async () => {
    // Validate form data before making the API call
    const validationErrors = formValidation();

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setUpdatePasswordLoading(true);

    try {
      const { data, error } = await authClient.changePassword({
        newPassword: formData.newPassword,
        currentPassword: formData.currentPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        switch (error.code) {
          case "INVALID_PASSWORD":
            setErrors((prev) => ({
              ...prev,
              currentPassword: updatePasswordTranslations(
                "errors.incorrectCurrentPassword",
              ),
            }));
            break;
          default:
            setErrors((prev) => ({
              ...prev,
              general:
                updatePasswordTranslations("errors.updateFailed") ||
                "An error occurred while updating password",
            }));
            break;
        }
        return;
      }

      state.setOpen(false);
    } catch (err) {
      console.error("Error updating password:", err);
      setErrors((prev) => ({
        ...prev,
        general:
          updatePasswordTranslations("errors.updateFailed") ||
          "An error occurred while updating password",
      }));
      return;
    } finally {
      setUpdatePasswordLoading(false);
    }

    // Show success toast
    toast.success(updatePasswordTranslations("toast.updateSuccess.title"), {
      description: updatePasswordTranslations(
        "toast.updateSuccess.description",
      ),
    });
  };

  return (
    <Modal>
      <Button
        variant="outline"
        className="bg-warning-soft border-warning/50 hover:bg-warning/20 focus:ring-warning/50"
        size="sm"
        onPress={state.open}
      >
        <KeyRound size={16} />
        {updatePasswordTranslations("buttons.updatePassword")}
      </Button>

      <Modal.Backdrop isOpen={state.isOpen} onOpenChange={state.setOpen}>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Icon className="bg-warning-soft text-warning-soft-foreground">
                <KeyRound size={20} />
              </Modal.Icon>
              <Modal.Heading>
                {updatePasswordTranslations("title")}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="p-1 space-y-4">
              {errors.general && (
                <Alert status="danger">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Title>
                      {generalTranslations("alerts.networkError.title")}
                    </Alert.Title>
                    <Alert.Description>
                      {generalTranslations("alerts.networkError.description")}
                    </Alert.Description>
                  </Alert.Content>
                </Alert>
              )}
              <Form className="space-y-4">
                <TextField
                  variant="secondary"
                  name="currentPassword"
                  type="password"
                  isInvalid={!!errors.currentPassword}
                >
                  <Label>
                    {updatePasswordTranslations("fields.currentPassword.label")}
                  </Label>
                  <Input
                    placeholder={updatePasswordTranslations(
                      "fields.currentPassword.placeholder",
                    )}
                    value={formData.currentPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    onFocus={() =>
                      setErrors((prev) => ({ ...prev, currentPassword: "" }))
                    }
                  />
                  <FieldError>{errors.currentPassword}</FieldError>
                </TextField>
                <TextField
                  variant="secondary"
                  name="newPassword"
                  type="password"
                  isInvalid={!!errors.newPassword}
                >
                  <Label>
                    {updatePasswordTranslations("fields.newPassword.label")}
                  </Label>
                  <Input
                    placeholder={updatePasswordTranslations(
                      "fields.newPassword.placeholder",
                    )}
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    onFocus={() =>
                      setErrors((prev) => ({ ...prev, newPassword: "" }))
                    }
                  />
                  <FieldError>{errors.newPassword}</FieldError>
                </TextField>
                <TextField
                  variant="secondary"
                  name="confirmNewPassword"
                  type="password"
                  isInvalid={!!errors.confirmNewPassword}
                >
                  <Label>
                    {updatePasswordTranslations(
                      "fields.confirmNewPassword.label",
                    )}
                  </Label>
                  <Input
                    placeholder={updatePasswordTranslations(
                      "fields.confirmNewPassword.placeholder",
                    )}
                    value={formData.confirmNewPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        confirmNewPassword: e.target.value,
                      }))
                    }
                    onFocus={() =>
                      setErrors((prev) => ({ ...prev, confirmNewPassword: "" }))
                    }
                  />
                  <FieldError>{errors.confirmNewPassword}</FieldError>
                </TextField>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="secondary">
                {updatePasswordTranslations("buttons.cancel")}
              </Button>
              <Button onPress={handleUpdatePassword}>
                {updatePasswordLoading
                  ? updatePasswordTranslations("buttons.updatingPassword")
                  : updatePasswordTranslations("buttons.updatePassword")}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
