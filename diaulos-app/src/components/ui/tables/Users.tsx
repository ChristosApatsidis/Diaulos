// componetnents/ui/tables/Users.tsx
"use client";

import { useTranslations } from "next-intl";
import { toast, Button, Table, EmptyState } from "@heroui/react";
import { useState, useEffect, Suspense } from "react";
import useSWR from "swr";
import { authClient } from "@/lib/better-auth/auth-client";
import ViewUserDetailsModal from "@/components/ui/modals/ViewUserDetails";
import type { User } from "@/types";

export type UsersResponse = {
  users: User[];
  stats: {
    total: number;
    admins: number;
    viewers: number;
    users: number;
  };
  page: number;
  totalPages: number;
  limit: number;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function UsersTable() {
  const generalTranslations = useTranslations("general");
  const usersTableTranslations = useTranslations("component_ui_tables_users");

  const [page, setPage] = useState<Number>(1);
  const [limit, setLimit] = useState<Number>(10);

  const {
    data: usersData,
    error: usersError,
    isValidating: usersValidating,
    mutate: fetchUsers,
  } = useSWR<UsersResponse>(
    `/api/admin/users-management/users?page=${page}&limit=${limit}`,
    fetcher,
    { revalidateOnFocus: true, loadingTimeout: 10000, keepPreviousData: true },
  );

  // Define the columns for the users table
  const columns = [
    {
      id: "name",
      name: usersTableTranslations("columns.name"),
      align: "start",
    },
    {
      id: "username",
      name: usersTableTranslations("columns.username"),
      align: "start",
    },
    {
      id: "email",
      name: usersTableTranslations("columns.email"),
      align: "start",
    },
    {
      id: "role",
      name: usersTableTranslations("columns.role"),
      align: "start",
    },
    {
      id: "branch",
      name: usersTableTranslations("columns.branch"),
      align: "start",
    },
    {
      id: "rank",
      name: usersTableTranslations("columns.rank"),
      align: "start",
    },
    {
      id: "actions",
      name: usersTableTranslations("columns.actions"),
      align: "start",
    },
    { id: "viewUser", name: "", align: "start" },
  ];

  if (usersError) {
    return (
      <div className="container mx-auto px-4 py-4">
        <p className="text-red-500">
          {generalTranslations("errors.fetchingData")}
        </p>
      </div>
    );
  }

  if (usersValidating && !usersData) {
    return (
      <div className="container mx-auto px-4 py-4">
        <p>{generalTranslations("loading")}</p>
      </div>
    );
  }

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content>
          {/* Table Header */}
          <Table.Header columns={columns}>
            {(column) => (
              <Table.Column isRowHeader={column.id === "name"} key={column.id}>
                {column.name}
              </Table.Column>
            )}
          </Table.Header>
          {/* Table Body */}
          <Table.Body items={usersData?.users || []}>
            {(user: User) => (
              <Table.Row key={user.id}>
                <Table.Cell>{user.name}</Table.Cell>
                <Table.Cell>{user.username || "-"}</Table.Cell>
                <Table.Cell>{user.email || "-"}</Table.Cell>
                <Table.Cell>{user.role}</Table.Cell>
                <Table.Cell>{user.branch}</Table.Cell>
                <Table.Cell>{user.rank}</Table.Cell>
                <Table.Cell>
                  <UserActions
                    user={user}
                    onUserDeleted={fetchUsers}
                    onUserUpdated={fetchUsers}
                  />
                </Table.Cell>
                <Table.Cell>
                  <ViewUserDetailsModal user={user} />
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}

function UserActions({
  user,
  onUserDeleted,
  onUserUpdated,
}: {
  user: User;
  onUserDeleted: () => void;
  onUserUpdated: () => void;
}) {
  const usersTableTranslations = useTranslations("component_ui_tables_users");
  const { data: session } = authClient.useSession();

  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Handle delete user action — called after modal confirmation
  const handleDeleteUser = () => {
    setIsDeleting(true);

    fetch(`/api/admin/users-management/users/${user.id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete user");
        toast.success(usersTableTranslations("toast.deleteSuccess.title"), {
          description: usersTableTranslations(
            "toast.deleteSuccess.description",
          ),
        });
        onUserDeleted();
      })
      .catch((err) =>
        toast.danger(usersTableTranslations("toast.deleteError.title"), {
          description: usersTableTranslations("toast.deleteError.description"),
        }),
      )
      .finally(() => setIsDeleting(false));
  };

  return (
    <div className="flex gap-2">
      {/* Delete User Button */}
      {session?.user?.id !== user.id && (
        <Button
          size="sm"
          variant="danger"
          onPress={handleDeleteUser}
          isDisabled={isDeleting}
        >
          {usersTableTranslations("buttons.delete")}
        </Button>
      )}

      {/* Update User Button */}
      {session?.user?.id !== user.id && (
        <Button size="sm" variant="primary" onPress={() => onUserUpdated()}>
          Edit
        </Button>
      )}
    </div>
  );
}
