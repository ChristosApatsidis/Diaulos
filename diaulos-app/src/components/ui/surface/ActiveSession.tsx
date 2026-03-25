// components/ui/cards/ActiveSession.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Separator, Surface } from "@heroui/react";
import { CircleUserRound, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/better-auth/auth-client";

/**
 * ActiveSession component displays the current user's session information.
 */
export default function ActiveSession() {
  const router = useRouter();
  const activesessionTranslations = useTranslations(
    "component_ui_cards_activeSession",
  );

  const { data: session, error: sessionError } = authClient.useSession();
  const [loadingSignOut, setLoadingSignOut] = useState(false);

  if (sessionError) {
    return (
      <Card>
        <Card.Header>
          <Card.Title>{activesessionTranslations("errorTitle")}</Card.Title>
        </Card.Header>
        <Card.Description>{sessionError.message}</Card.Description>
      </Card>
    );
  }

  if (!session) {
    return null;
  }

  // Sign out action with optimistic UI update and error handling
  const signOutAction = async () => {
    setLoadingSignOut(true);

    // sleep for 500ms to show loading state
    await new Promise((resolve) => setTimeout(resolve, 500));

    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          setLoadingSignOut(false);
        },
        onError: () => {
          setLoadingSignOut(false);
        },
        finally: () => {
          setLoadingSignOut(false);
        },
      },
    });
  };

  return (
    <Surface className="flex w-full flex-col gap-2 rounded-3xl border border-secondary p-4">
      {/* Header with title and separator */}
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold">
          {activesessionTranslations("activeSessionTitle")}
        </h3>
        <Separator variant="secondary" className="my-0 mx-0" />
      </div>
      {/* Display username or email */}
      <div>
        <p>
          {activesessionTranslations("username", {
            username:
              session?.user?.username || session?.user?.email || "Unknown User",
          })}
        </p>
      </div>
      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          variant="primary"
          onPress={() => router.push("/profile")}
          isDisabled={loadingSignOut}
        >
          <CircleUserRound />
          {activesessionTranslations("profileButton")}
        </Button>
        <Button
          variant="danger"
          onPress={signOutAction}
          isDisabled={loadingSignOut}
        >
          <LogOut />
          {loadingSignOut
            ? activesessionTranslations("signOutLoadingButton")
            : activesessionTranslations("signOutButton")}
        </Button>
      </div>
    </Surface>
  );
}
