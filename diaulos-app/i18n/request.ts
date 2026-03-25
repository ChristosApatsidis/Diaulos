// i18n/request.ts
"use server";

import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

const supportedLocales = ["en", "el"]; // Define supported locales

/**
 * getRequestConfig is a server-side function that retrieves the user's locale preference from cookies and loads the corresponding translation messages.
 * It ensures that only supported locales are used, defaulting to English if an unsupported locale is found.
 */
export default getRequestConfig(async () => {
  const store = await cookies();

  let locale = store.get("locale")?.value || "en";

  // Validate locale against supported locales
  if (!supportedLocales.includes(locale)) {
    locale = "en"; // Fallback to default locale if unsupported
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
