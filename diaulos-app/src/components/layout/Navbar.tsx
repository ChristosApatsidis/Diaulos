// components/layout/Navbar.tsx
"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  buttonVariants,
  Dropdown,
  Label,
  Separator,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import {
  BackIcon,
  ChevronDown,
  DatabaseIcon,
  Logo,
  SettingsIcon,
  SignOutIcon,
  UserIcon,
} from "@/components/icons";
import LocaleSelect from "@/components/ui/buttons/LocaleSelect";
import ThemeToggle from "@/components/ui/buttons/ThemeToggle";
import { authClient } from "@/lib/better-auth/auth-client";
import { siteConfig } from "@/config/site";

export const Navbar = () => {
  const router = useRouter();
  const navigationTranslators = useTranslations("navigation");
  const { data: session, isPending, error } = authClient.useSession();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isMenuOpen) setActiveDropdown(null);
  }, [isMenuOpen]);

  const getNavLabel = (item: { label: string; navigationKey?: string }) =>
    item.navigationKey
      ? navigationTranslators(
          item.navigationKey as Parameters<typeof navigationTranslators>[0],
        )
      : item.label;

  const signOutAction = async () => {
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.push("/") },
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="flex h-16 w-full max-w-full items-center justify-between px-4 gap-2">
        {/* Left: brand + desktop nav */}
        <div className="flex items-center gap-6">
          <NextLink className="flex items-center" href="/">
            <Logo size={8} />
            <span className="font-bold" suppressHydrationWarning>
              Δίαυλος
            </span>
          </NextLink>
          <nav className="hidden sm:flex items-center gap-4">
            {siteConfig.navItems.map((item) =>
              item.dropdownItems ? (
                <Dropdown key={item.href}>
                  <Dropdown.Trigger className="flex items-center gap-1 text-sm text-foreground hover:text-primary transition-colors bg-transparent border-0 cursor-pointer">
                    {getNavLabel(item)}
                    <ChevronDown className="h-4 w-4" />
                  </Dropdown.Trigger>
                  <Dropdown.Popover>
                    <Dropdown.Menu aria-label={`${getNavLabel(item)} dropdown`}>
                      {item.dropdownItems.map((dropdownItem) => (
                        <Dropdown.Item
                          key={dropdownItem.href}
                          id={dropdownItem.href}
                          href={dropdownItem.href}
                        >
                          <span className="flex items-center gap-2">
                            {dropdownItem.icon && (
                              <dropdownItem.icon size={6} />
                            )}
                            {getNavLabel(dropdownItem)}
                          </span>
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown.Popover>
                </Dropdown>
              ) : (
                <NextLink
                  key={item.href}
                  className="text-sm text-foreground hover:text-primary transition-colors"
                  href={item.href}
                >
                  {getNavLabel(item)}
                </NextLink>
              ),
            )}
          </nav>
        </div>
        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {!mounted ? null : isPending ? null : error ? (
            <Button isIconOnly variant="danger" onPress={signOutAction}>
              <SignOutIcon size={6} />
            </Button>
          ) : (
            session && (
              <>
                {session.user.role === "admin" && (
                  <Button
                    isIconOnly
                    variant="outline"
                    size="lg"
                    onPress={() => router.push("/admin/dashboard")}
                  >
                    <SettingsIcon size={6} />
                  </Button>
                )}
                <UserDropdown />
              </>
            )
          )}
          <LocaleSelect />
          <ThemeToggle />
          {/* Mobile toggle */}
          <Button
            className="sm:hidden"
            variant="outline"
            size="lg"
            onPress={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? "✕" : "☰"}
          </Button>
        </div>
      </div>
      {/* Mobile menu */}
      {isMenuOpen && (
        <MobileMenu
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
          getNavLabel={getNavLabel}
          onClose={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
};

const MobileMenu = ({
  activeDropdown,
  setActiveDropdown,
  getNavLabel,
  onClose,
}: {
  activeDropdown: number | null;
  setActiveDropdown: (value: number | null) => void;
  getNavLabel: (item: { label: string; navigationKey?: string }) => string;
  onClose: () => void;
}) => {
  const generalTranslators = useTranslations("general");

  if (activeDropdown !== null) {
    return (
      <div className="border-t border-border px-4 py-2 flex flex-col gap-2">
        <button
          className="flex items-center gap-2 text-sm text-foreground bg-transparent border-0 cursor-pointer p-0"
          onClick={() => setActiveDropdown(null)}
        >
          <BackIcon size={6} />
          <span>{generalTranslators("back")}</span>
        </button>
        <Separator />
        {siteConfig.navItems[activeDropdown].dropdownItems?.map(
          (dropdownItem) => (
            <NextLink
              key={dropdownItem.href}
              className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors py-1"
              href={dropdownItem.href}
              onClick={onClose}
            >
              {dropdownItem.icon && <dropdownItem.icon className="w-4 h-4" />}
              {getNavLabel(dropdownItem)}
            </NextLink>
          ),
        )}
      </div>
    );
  }

  return (
    <div className="border-t border-border px-4 py-2 flex flex-col gap-2">
      {siteConfig.navItems.map((item) =>
        item.dropdownItems ? (
          <button
            key={item.href}
            className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors py-1 bg-transparent border-0 cursor-pointer p-0 text-left"
            onClick={() => setActiveDropdown(siteConfig.navItems.indexOf(item))}
          >
            {item.icon && <item.icon className="w-4 h-4" />}
            {getNavLabel(item)}
          </button>
        ) : (
          <NextLink
            key={item.href}
            className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors py-1"
            href={item.href}
            onClick={onClose}
          >
            {item.icon && <item.icon className="w-4 h-4" />}
            {getNavLabel(item)}
          </NextLink>
        ),
      )}
    </div>
  );
};

const UserDropdown = () => {
  const navigationProfileDropdownTranslators = useTranslations(
    "navigation.profileDropdown",
  );
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const signOutAction = async () => {
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.push("/") },
    });
  };

  return (
    <Dropdown>
      <Dropdown.Trigger
        className={buttonVariants({
          variant: "outline",
          isIconOnly: true,
          size: "lg",
        })}
      >
        <UserIcon size={6} />
      </Dropdown.Trigger>
      <Dropdown.Popover>
        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-0">
              <p className="text-sm leading-5 font-medium">
                {session?.user.username}
              </p>
              <p className="text-xs leading-none text-muted">
                {session?.user.email}
              </p>
            </div>
          </div>
        </div>
        <Dropdown.Menu
          aria-label="Profile Actions"
          disabledKeys={["signed-in-as"]}
        >
          <Dropdown.Section>
            <Dropdown.Item
              id="profile"
              href="/profile"
              aria-label={navigationProfileDropdownTranslators(
                "profile.ariaLabel",
              )}
            >
              <UserIcon size={4} />
              <Label>
                {navigationProfileDropdownTranslators("profile.title")}
              </Label>
            </Dropdown.Item>

            <Dropdown.Item
              id="database"
              href="/database"
              aria-label={navigationProfileDropdownTranslators(
                "database.ariaLabel",
              )}
            >
              <DatabaseIcon size={4} />
              <Label>
                {navigationProfileDropdownTranslators("database.title")}
              </Label>
            </Dropdown.Item>
            <Separator />
            <Dropdown.Item
              id="logout"
              className="text-danger"
              onAction={signOutAction}
              aria-label={navigationProfileDropdownTranslators(
                "signOut.ariaLabel",
              )}
            >
              <SignOutIcon size={4} />
              <Label className="text-danger">
                {navigationProfileDropdownTranslators("signOut.title")}
              </Label>
            </Dropdown.Item>
          </Dropdown.Section>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
};
