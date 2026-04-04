// components/ui/surface/InfoCard.tsx

import React from "react";
import { Separator, Surface } from "@heroui/react";

type InfoCardProps = {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "tertiary" | "transparent";
  className?: string;
};

function InfoCard({
  children,
  variant = "default",
  className = "",
}: InfoCardProps) {
  return (
    <Surface
      variant={variant}
      className={`flex flex-col rounded-3xl border border-secondary p-4 ${className}`}
    >
      {children}
    </Surface>
  );
}

type HeaderProps = {
  children: React.ReactNode;
};

function Header({ children }: HeaderProps) {
  // Find Title and Actions children
  let title = null;
  let actions = null;
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if ((child.type as any).displayName === "InfoCardHeaderTitle") {
      title = child;
    } else if ((child.type as any).displayName === "InfoCardHeaderActions") {
      actions = child;
    }
  });
  return (
    <>
      <div className="flex items-start justify-between">
        {title}
        {actions && <div>{actions}</div>}
      </div>
      <Separator className="my-1" />
    </>
  );
}

function HeaderTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h4 className={`text-base font-semibold text-foreground ${className}`}>
      {children}
    </h4>
  );
}
HeaderTitle.displayName = "InfoCardHeaderTitle";

function HeaderActions({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
HeaderActions.displayName = "InfoCardHeaderActions";

function Body({ children }: { children: React.ReactNode }) {
  return <div className="pt-2">{children}</div>;
}

function Footer({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Separator className="my-2" />
      <div className="text-sm text-muted-foreground">{children}</div>
    </>
  );
}

InfoCard.Header = Object.assign(Header, {
  Title: HeaderTitle,
  Actions: HeaderActions,
});
InfoCard.Body = Body;
InfoCard.Footer = Footer;

export { InfoCard };
