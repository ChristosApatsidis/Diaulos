// app/layout-client.tsx
"use client";

import { use, useEffect, useState } from "react";
import { Toast, Spinner } from "@heroui/react";
import { authClient } from "@/lib/better-auth/auth-client";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";

/**
 * This component is used to wrap the children of the RootLayout and ensures that it is only rendered on the client side. This is necessary to prevent hydration mismatches
 * due to theme changes or other client-only state that may be present in the children.
 */
export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  var {
    data: session,
    isPending: sessionIsPending,
    error: sessionError,
  } = authClient.useSession();
  const generalTranslations = useTranslations("general");
  const [mounted, setMounted] = useState(false);

  // This ensures that the component is only rendered on the client side
  // and prevents hydration mismatches due to theme changes or other client-only state.
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const Loading = () => (
    <main className="container mx-auto px-4">
      <motion.div
        className="flex flex-col items-center pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Spinner size="xl" />
        <span className="text-sm text-muted">
          {generalTranslations("loading")}
        </span>
      </motion.div>
    </main>
  );

  if (sessionError) {
    return (
      <main className="container mx-auto px-4">
        <p>
          Error:{" "}
          {sessionError?.message || generalTranslations("errors.generic")}
        </p>
      </main>
    );
  }

  return (
    <div className="h-full">
      <Toast.Provider />
      <AnimatePresence>
        {sessionIsPending ? <Loading /> : children}
      </AnimatePresence>
    </div>
  );
}
