// components/ui/modals/ViewUserDetails.tsx
"use client";

import { Button, Modal, useOverlayState } from "@heroui/react";
import { User as UserIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import UserDetailsPDFButton from "@/components/ui/buttons/UserDetailsPDF";
import AccountInformationCard from "@/components/ui/cards/AccountInformation";
import MilitaryInformationCard from "@/components/ui/cards/MilitaryInformation";
import PersonalInfoCard from "@/components/ui/cards/PersonalInfoCard";
import type { User } from "@/types";

/**
 * ViewUserDetailsModal is a modal component that displays detailed information about a user, including their personal info, military info, and account info. It uses the Modal component from HeroUI and is triggered by a button. The modal content is organized into cards for better readability.
 * @param user - The user object containing all the details to be displayed in the modal.
 * @returns A React component that renders a button to open the modal and the modal itself with user details.
 */
export default function ViewUserDetailsModal({ user }: { user: User }) {
  const viewUserDetailsTranslations = useTranslations(
    "component_ui_modals_viewUserDetails",
  );

  const state = useOverlayState();

  return (
    <Modal>
      <Button
        variant="outline"
        className="bg-warning-soft border-warning/50 hover:bg-warning/20 focus:ring-warning/50"
        size="sm"
        onPress={state.open}
      >
        <UserIcon size={16} />
        {viewUserDetailsTranslations("buttons.viewDetails")}
      </Button>
      <Modal.Backdrop isOpen={state.isOpen} onOpenChange={state.setOpen}>
        <Modal.Container size="lg">
          <Modal.Dialog className="md:min-w-[700px] lg:min-w-[800px]">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Icon className="bg-warning-soft text-warning-soft-foreground">
                <UserIcon size={20} />
              </Modal.Icon>
            </Modal.Header>
            <Modal.Body className="p-1 space-y-2">
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  <PersonalInfoCard user={user} />
                  <MilitaryInformationCard user={user} />
                </div>
                <AccountInformationCard user={user} />
              </div>
            </Modal.Body>

            <Modal.Footer>
              <UserDetailsPDFButton user={user} />
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
