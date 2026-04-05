// admin/units/page.tsx
"use client";

import {
  FileCode,
  Folder,
  Image,
  Package,
  Paintbrush,
  Plane,
} from "lucide-react";
import { useTranslations } from "next-intl";
import TreeView, { type TreeNodeData } from "@/components/ui/treeView";
import useSWR from "swr";
import type { Unit } from "@/types/units";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminUnitsPage() {
  const _generalTranslations = useTranslations("general");

  const {
    data: unitsData,
    error: unitsError,
    isLoading: unitsLoading,
  } = useSWR<{ units: UnitWithChildren[] }>(
    "/api/admin/units?tree=true",
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 0,
      refreshInterval: 5000,
    },
  );

  /** 
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
  */

  type UnitWithChildren = Unit & {
    _id: string;
    children?: UnitWithChildren[];
  };

  const unitToTreeNode = (unit: UnitWithChildren): TreeNodeData => ({
    id: unit._id,
    label: unit.name,
    icon: ["af_general_staff", "navy_general_staff", "army"].includes(
      unit.unitType,
    )
      ? Plane
      : Folder,
    iconColor: "#3b82f6",
    defaultOpen: true,
    children: unit.children?.map(unitToTreeNode),
  });
  const myTree: TreeNodeData[] = unitsData?.units.map(unitToTreeNode) ?? [];

  return (
    <main className="px-4 py-4 pb-4 flex flex-col gap-2">
      <TreeView data={myTree} />
    </main>
  );
}
