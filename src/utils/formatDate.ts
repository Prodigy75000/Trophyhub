// utils/formatDate.ts

export function formatDate(isoString?: string | null, locale: string = "fr-FR"): string {
  if (!isoString) return "N/A";

  const date = new Date(isoString);

  if (isNaN(date.getTime())) {
    return "Date invalid";
  }

  // Combine date and time into one call for efficiency
  return date.toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
