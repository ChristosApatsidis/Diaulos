// admin/users/page.tsx
"use client";

import UsersTable from "@/components/ui/tables/Users";

export default function AdminUsersPage() {
  return (
    <main className="px-4 py-4 pb-4 flex flex-col gap-2">
      <UsersTable />
    </main>
  );
}
