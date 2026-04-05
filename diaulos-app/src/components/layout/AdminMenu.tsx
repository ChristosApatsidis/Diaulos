// components/layout/AdminMenu.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button, ListBox, Select } from "@heroui/react";
import {
  DatabaseIcon,
  Network,
  SettingsIcon,
  ShieldUser,
  UserIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

export default function AdminMenu() {
  const pathname = usePathname();
  const adminMenuTranslations = useTranslations("adminMenu");
  const router = useRouter();

  const adminNavItems = [
    {
      label: adminMenuTranslations("dashboard"),
      href: "/admin/dashboard",
      icon: ShieldUser,
    },
    {
      label: adminMenuTranslations("users"),
      href: "/admin/users",
      icon: UserIcon,
    },
    {
      label: adminMenuTranslations("database"),
      href: "/admin/database",
      icon: DatabaseIcon,
    },
    {
      label: adminMenuTranslations("units"),
      href: "/admin/units",
      icon: Network,
    },
    {
      label: adminMenuTranslations("settings"),
      href: "/admin/settings",
      icon: SettingsIcon,
    },
  ];

  return (
    <div>
      {/* Mobile Dropdown */}
      <div className="md:hidden p-2 border-b border-border">
        <Select
          className="w-full p-2"
          value={pathname}
          onChange={(value) => router.push(value as string)}
          aria-label="Admin navigation menu"
        >
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {adminNavItems.map((item) => (
                <ListBox.Item
                  key={item.href}
                  id={item.href}
                  textValue={item.href}
                >
                  {item.label}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-full w-56 xl:w-64 bg-background border-r border-border p-2 flex flex-col">
        <nav className="flex flex-col gap-2">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Button
                key={item.href}
                variant={isActive ? "tertiary" : "outline"}
                onPress={() => router.push(item.href)}
                fullWidth
                className="rounded-md justify-start"
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
