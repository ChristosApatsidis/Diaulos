// components/ui/forms/SignIn.tsx
"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Surface,
  TextField,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/better-auth/auth-client";

export default function SignIn() {
  const signInTranslations = useTranslations("component_ui_form_signIn");

  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    general?: string;
  }>({});
  const [formData, setFormData] = useState({
    username: "",
    password: "82hcuHSG$2njnjD",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Define validation rules for form fields
  const formValidationRules = {
    username: {
      required: signInTranslations("validation.usernameRequired"),
      minLength: {
        value: 4,
        message: signInTranslations("validation.usernameMinLength"),
      },
      maxLength: {
        value: 20,
        message: signInTranslations("validation.usernameMaxLength"),
      },
    },
    password: {
      required: signInTranslations("validation.passwordRequired"),
      minLength: {
        value: 4,
        message: signInTranslations("validation.passwordMinLength"),
      },
    },
  };

  // Validates form data and sets error messages if validation fails
  const formValidation = () => {
    const newErrors: typeof errors = {};

    // Username validation
    if (!formData.username) {
      newErrors.username = formValidationRules.username.required;
    } else if (
      formData.username.length < formValidationRules.username.minLength.value
    ) {
      newErrors.username = formValidationRules.username.minLength.message;
    } else if (
      formData.username.length > formValidationRules.username.maxLength.value
    ) {
      newErrors.username = formValidationRules.username.maxLength.message;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = formValidationRules.password.required;
    } else if (
      formData.password.length < formValidationRules.password.minLength.value
    ) {
      newErrors.password = formValidationRules.password.minLength.message;
    }

    return newErrors;
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form data before making the API call
    const validationErrors = formValidation();

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // Submitting the form, disable the submit button to prevent multiple submissions
    setIsSubmitting(true);

    try {
      const { data, error } = await authClient.signIn.username({
        username: formData.username,
        password: formData.password,
      });

      console.log("Sign-in response:", { data, error });

      // Handle specific error codes and set user-friendly messages
      if (error) {
        switch (error.code) {
          case "USERNAME_TOO_SHORT":
            setErrors({
              username: signInTranslations("errors.usernameTooShort"),
            });
            break;
          case "INVALID_USERNAME_OR_PASSWORD":
            setErrors({
              general: signInTranslations("errors.invalidUsernameOrPassword"),
            });
            break;
          case "USER_DISABLED":
            setErrors({
              password: signInTranslations("errors.userDisabled"),
            });
            break;
          case "TOO_MANY_ATTEMPTS":
            setErrors({
              general: signInTranslations("errors.tooManyAttempts"),
            });
            break;
          case "NETWORK_ERROR":
            setErrors({
              general: signInTranslations("errors.networkError"),
            });
            break;
          default:
            setErrors({
              general:
                error.message ?? signInTranslations("errors.networkError"),
            });
        }
        return;
      }
    } catch (error) {
      setErrors({ general: signInTranslations("errors.networkError") });
      console.error("Sign-in error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Surface className="flex w-full min-w-[340px] flex-col gap-4 rounded-3xl p-6">
      {/* General error message (e.g. network error, too many attempts) */}
      {errors.general && (
        <Alert status="danger" className="alert--danger mb-4">
          {errors.general}
        </Alert>
      )}
      <Form className="flex flex-col gap-4" onSubmit={handleSignIn}>
        {/* Username Field */}
        <TextField
          variant="secondary"
          name="username"
          type="text"
          isInvalid={!!errors.username}
        >
          <Label>{signInTranslations("labels.username")}</Label>
          <Input
            placeholder={signInTranslations("placeholders.username")}
            value={formData.username}
            onChange={(e) => {
              setFormData({ ...formData, username: e.target.value });
              setErrors({ ...errors, username: "" }); // Clear username error on change
            }}
          />
          <FieldError>{errors.username}</FieldError>
        </TextField>
        {/* Password Field */}
        <TextField
          variant="secondary"
          name="password"
          type="password"
          isInvalid={!!errors.password}
        >
          <Label>{signInTranslations("labels.password")}</Label>
          <Input
            placeholder={signInTranslations("placeholders.password")}
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              setErrors({ ...errors, password: "" }); // Clear password error on change
            }}
          />
          <FieldError>{errors.password}</FieldError>
        </TextField>
        {/* Submit Button */}
        <div className="flex gap-2">
          <Button type="submit" isDisabled={isSubmitting}>
            {isSubmitting
              ? signInTranslations("buttons.submitting")
              : signInTranslations("buttons.submit")}
          </Button>
        </div>
      </Form>
    </Surface>
  );
}
