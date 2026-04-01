// admin/units/page.tsx
"use client";

import { useTranslations } from "next-intl";
import UsersTable from "@/components/ui/tables/Users";
import { useState } from "react";
import TreeView, { type TreeNodeData } from "@/components/ui/treeView";

import {
  ChevronRight,
  Folder,
  FolderOpen,
  FileCode,
  Paintbrush,
  Image,
  Package,
  Settings,
  GitBranch,
  Lock,
  BookOpen,
  LayoutGrid,
  TestTube,
  Globe,
  FileText,
  LucideIcon,
} from "lucide-react";

export default function AdminUnitsPage() {
  const generalTranslations = useTranslations("general");

  const myTree: TreeNodeData[] = [
    {
      id: 1,
      label: "src",
      icon: Folder,
      iconColor: "#3b82f6",
      defaultOpen: true,
      children: [
        { id: 2, label: "App.tsx", icon: FileCode, iconColor: "#3178c6" },
        {
          id: 3,
          label: "styles",
          icon: Folder,
          iconColor: "#38bdf8",
          defaultOpen: true,
          children: [
            {
              id: 6,
              label: "theme.css",
              icon: Paintbrush,
              iconColor: "#5129a8",
            },
          ],
        },
        { id: 4, label: "logo.svg", icon: Image, iconColor: "#a855f7" },
      ],
    },
    { id: 5, label: "package.json", icon: Package, iconColor: "#f59e0b" },
  ];

  return (
    <main className="px-4 py-4 pb-4 flex flex-col gap-2">
      <TreeView data={myTree} />
    </main>
  );
}
