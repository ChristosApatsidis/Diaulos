import type { IconSvgProps } from "./icons";

export type User = {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: string;
  branch: string;
  combatArmsSupportBranch: string;
  rank: string;
  specialization: string;
  unitOfService: string;
  createdAt: string;
  updatedAt: string;
  permissions: string[];
};

export type { IconSvgProps };
