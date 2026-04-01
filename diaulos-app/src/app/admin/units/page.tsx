// admin/units/page.tsx
"use client";

import { useTranslations } from "next-intl";
import UsersTable from "@/components/ui/tables/Users";

export default function AdminUnitsPage() {
  const generalTranslations = useTranslations("general");

  return (
    <main className="px-4 py-4 pb-4 flex flex-col gap-2">
      <h1>Units</h1>
    </main>
  );
}
