import { DateTime } from "luxon";

// Format date with time zone and DST info
export function formatDateTime({
  date,
  locale = "en-US",
  timeZone = "Europe/Athens",
  showDST = false,
}: {
  date: Date | string | number;
  locale?: string;
  timeZone?: string;
  showDST?: boolean;
}) {
  // Define labels for DST and standard time in supported locales
  const localeLabels: Record<string, { standard: string; dst: string }> = {
    "en": { standard: "Standard Time", dst: "Daylight Time" },
    "el": { standard: "Κανονική ώρα", dst: "Θερινή ώρα" },
  };

  // Get labels for the current locale, defaulting to English if not defined
  const labels = localeLabels[locale] || localeLabels["en"];

  // Convert input to DateTime in specified time zone
  const dt = DateTime.fromJSDate(new Date(date), { zone: timeZone }).setLocale(locale);

  // Format date and time
  const formatted = dt.toFormat("dd LLL yyyy, HH:mm");

  // If showDST is false, return formatted string without DST info
  if (!showDST) return formatted;

  // Calculate GMT offset and determine if DST is in effect
  const offset = dt.offset / 60; // in hours

  // Determine if DST is in effect for this date
  const isDST = dt.isInDST;

  // Construct final string with DST info
  const gmt = `GMT${offset >= 0 ? "+" : ""}${offset}`;

  // Choose appropriate label based on DST status
  const label = isDST ? labels.dst : labels.standard;

  // Return formatted date with time zone and DST info
  return `${formatted} (${gmt}, ${label})`;
}