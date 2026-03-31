// components/buttons/UserDetailsPDF.tsx
"use client";

import { Button } from "@heroui/react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { UserDetailsPDF } from "@/utils/pdf";

export default function UserDetailsPDFButton({ user }: { user: any }) {
  const locale = useLocale();
  const generalTranslations = useTranslations("general");
  const profileBannerTranslations = useTranslations(
    "component_ui_cards_profileBanner",
  );
  const personalInfoTranslations = useTranslations(
    "component_ui_cards_personalInfo",
  );
  const militaryInformationTranslations = useTranslations(
    "component_ui_cards_militaryInformation",
  );
  const accountInformationTranslations = useTranslations(
    "component_ui_cards_accountInformation",
  );

  return (
    <PDFDownloadLink
      document={
        <UserDetailsPDF
          user={user}
          locale={locale}
          generalTranslations={generalTranslations}
          personalInfoTranslations={personalInfoTranslations}
          militaryInformationTranslations={militaryInformationTranslations}
          accountInformationTranslations={accountInformationTranslations}
        />
      }
      fileName={`user-${user.username || "profile"}.pdf`}
      style={{ textDecoration: "none" }}
    >
      <Button variant="tertiary" size="sm">
        <Download size={16} />
        {profileBannerTranslations("buttons.downloadPDF")}
      </Button>
    </PDFDownloadLink>
  );
}
