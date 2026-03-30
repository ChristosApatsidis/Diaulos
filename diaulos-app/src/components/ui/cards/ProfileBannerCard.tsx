// components/ui/cards/ProfileBannerCard.tsx
"use client";

import { Chip, Button, Skeleton } from "@heroui/react";
import { InfoCard } from "@/components/ui/cards/InfoCard";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/better-auth/auth-client";
import { Avatar } from "@heroui/react";
import { useRouter } from "next/dist/client/components/navigation";
import { UserPen } from "lucide-react";
import UserDetailsPDFButton from "@/components/ui/buttons/UserDetailsPDF";
import { UpdatePasswordModal } from "@/components/ui/modals/UpdatePassword";

export default function ProfileBannerCard({
  editProfileButton,
  updatePasswordButton,
}: {
  editProfileButton?: boolean;
  updatePasswordButton?: boolean;
}) {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const generalTranslations = useTranslations("general");
  const profileBannerTranslations = useTranslations(
    "component_ui_cards_profileBanner",
  );

  return (
    <InfoCard>
      <InfoCard.Body>
        <div>
          <div className="flex gap-4">
            {isSessionPending ? (
              <Skeleton className="w-16 h-16 rounded-full" />
            ) : (
              <Avatar
                variant="soft"
                className="w-16 h-16 rounded-full"
                color="accent"
              >
                <Avatar.Fallback className="text-2xl bg-gradient-to-br from-blue-400 to-blue-500 text-white">
                  {session?.user?.name
                    ? session.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "?"}
                </Avatar.Fallback>
              </Avatar>
            )}
            <div>
              {isSessionPending ? (
                <div>
                  <Skeleton className="h-6 w-32 mb-1" />
                  <Skeleton className="h-4 w-24 mb-1" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-lg font-semibold leading-tight">
                    {session?.user?.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-1">
                    {session?.user?.username}
                  </p>
                  <div className="flex gap-2">
                    <Chip variant="soft" color="accent" size="sm">
                      {session?.user?.specialization || "No specialization"}
                    </Chip>
                    <Chip size="sm" color="accent" variant="soft">
                      {generalTranslations(
                        `ranks.${session?.user?.branch}.${session?.user?.rank}`,
                      ) || session?.user?.rank}
                    </Chip>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </InfoCard.Body>
      {(editProfileButton || updatePasswordButton) && (
        <InfoCard.Footer>
          {isSessionPending ? (
            <Skeleton className="h-8 w-24 rounded-3xl" />
          ) : (
            <div className="flex gap-2">
              {editProfileButton && (
                <Button
                  variant="tertiary"
                  size="sm"
                  onClick={() => router.push("/profile/edit")}
                >
                  <UserPen size={16} />
                  {profileBannerTranslations("buttons.edit")}
                </Button>
              )}
              {updatePasswordButton && <UpdatePasswordModal />}
              {session?.user && <UserDetailsPDFButton user={session.user} />}
            </div>
          )}
        </InfoCard.Footer>
      )}
    </InfoCard>
  );
}
