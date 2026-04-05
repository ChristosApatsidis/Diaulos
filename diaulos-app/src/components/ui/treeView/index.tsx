// components/ui/treeView/index.tsx
"use client";

import { useState } from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";

export type TreeNodeData = {
  id: number;
  label: string;
  icon: LucideIcon;
  iconColor?: string;
  count?: number;
  children?: TreeNodeData[];
  defaultOpen?: boolean;
};

/**
 * TreeNode component represents a single node in the tree. It handles its own open/closed state and selection state.
 * It displays a chevron if it has children, a custom Lucide icon, the label, and an optional badge for count.
 * When clicked, it toggles selection and opens/closes if it has children.
 */
function TreeNode({
  node,
  defaultExpanded,
}: {
  node: TreeNodeData;
  defaultExpanded?: boolean;
}) {
  const [open, setOpen] = useState(
    defaultExpanded || node.defaultOpen || false,
  );
  const [selected, _setSelected] = useState(false);
  const hasChildren = !!node.children?.length;
  const Icon = node.icon;

  return (
    <div>
      <div
        onClick={() => hasChildren && setOpen(!open)}
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer text-sm select-none
          transition-colors duration-100 hover:bg-gray-100 dark:hover:bg-gray-800`}
      >
        {/* Chevron */}
        <ChevronRight
          size={13}
          className={`flex-shrink-0 text-gray-400 transition-transform duration-200
            ${hasChildren ? "" : "opacity-0 pointer-events-none"}
            ${open ? "rotate-90" : ""}`}
        />

        {/* Custom Lucide icon */}
        <Icon
          size={16}
          className="flex-shrink-0"
          style={{
            color: node.iconColor || "#9ca3af",
          }}
          strokeWidth={1.75}
        />

        {/* Label */}
        <span
          className={`flex-1 truncate ${selected ? "text-blue-600 dark:text-blue-400" : "text-gray-800 dark:text-gray-200"}`}
        >
          {node.label}
        </span>

        {/* Badge */}
        {node.count != null && (
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full font-medium
            ${selected ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}
          >
            {node.count}
          </span>
        )}
      </div>

      {/* Children */}
      {hasChildren && open && (
        <div
          className="pl-5 relative before:absolute before:left-[15px] before:top-0
          before:bottom-2 before:w-px before:bg-gray-200 dark:before:bg-gray-700"
        >
          {node.children?.map((child) => (
            <TreeNode key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * TreeView component takes an array of TreeNodeData and renders the tree structure. It simply maps over the data and renders a TreeNode for each item.
 * @param data - An array of TreeNodeData representing the tree structure to be rendered.
 * @returns A React component that renders the tree view.
 */
export default function TreeView({
  data,
  defaultExpanded = false,
}: {
  data: TreeNodeData[];
  defaultExpanded?: boolean;
}) {
  return (
    <div className="py-2">
      {data.map((node) => (
        <TreeNode key={node.id} node={node} defaultExpanded={defaultExpanded} />
      ))}
    </div>
  );
}
