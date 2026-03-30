// admin/users/page.tsx
"use client";

import { useTranslations } from "next-intl";
import { toast, Button, Table, EmptyState } from "@heroui/react";
import { useState, useEffect, Suspense } from "react";
import useSWR from "swr";
import UsersTable from "@/components/ui/tables/Users";

export default function AdminUsersPage() {
  const generalTranslations = useTranslations("general");
  const adminUsersManagementTranslations = useTranslations(
    "adminUsersManagement",
  );

  return (
    <main className="px-4 py-4 pb-4 flex flex-col gap-2">
      <UsersTable />
    </main>
  );
}
