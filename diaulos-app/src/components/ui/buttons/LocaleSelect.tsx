// components/ui/buttons/LocaleSelect.tsx
"use client";

import { useRouter } from "next/navigation";
import { buttonVariants, Dropdown } from "@heroui/react";
import { useLocale } from "next-intl";
import { CheckIcon, LanguageIcon } from "@/components/icons";

const languages = [
  { key: "en", label: "English", icon: "🇬🇧" },
  { key: "el", label: "Ελληνικά", icon: "🇬🇷" },
];

export default function LocaleSelect() {
  const locale = useLocale();
  const router = useRouter();

  const handleChange = (newLocale: string) => {
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  };

  return (
    <Dropdown>
      <Dropdown.Trigger
        className={buttonVariants({
          isIconOnly: true,
          variant: "outline",
          size: "lg",
        })}
        aria-label="Select language"
      >
        <LanguageIcon size={6} />
      </Dropdown.Trigger>

      <Dropdown.Popover>
        <Dropdown.Menu aria-label="Select language">
          {languages.map((lang) => (
            <Dropdown.Item
              key={lang.key}
              id={lang.key}
              onAction={() => handleChange(lang.key)}
            >
              <span className="flex items-center gap-2">
                <span>{lang.icon}</span>
                <span>{lang.label}</span>
                {locale === lang.key && <CheckIcon size={4} />}
              </span>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
