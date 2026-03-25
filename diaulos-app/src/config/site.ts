import { HomeIcon, SearchIcon } from "@/components/icons";

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Δίαυλος",
  description: "Δίαυλος",
  navItems: [
    {
      label: "Home",
      navigationKey: "home.title",
      href: "/",
      icon: HomeIcon,
    },
    {
      label: "Page 2",
      navigationKey: "page2.title",
      href: "/docs",
      icon: SearchIcon,
    },
    {
      label: "Page3",
      navigationKey: "page3.title",
      href: "/pricing",
      icon: HomeIcon,
      dropdownItems: [
        {
          label: "Personal",
          navigationKey: "page3.personal.title",
          href: "/pricing/personal",
          icon: SearchIcon,
        },
        {
          label: "Business",
          navigationKey: "page3.business.title",
          href: "/pricing/business",
        },
        {
          label: "Enterprise",
          navigationKey: "page3.enterprise.title",
          href: "/pricing/enterprise",
        },
      ],
    },
  ],
  links: {
    github: "https://github.com/heroui-inc/heroui",
  },
};
