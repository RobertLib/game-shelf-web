export type DateFormatType = "date" | "time" | "datetime";

export function formatDate(
  date?: string | Date | null,
  format: DateFormatType = "datetime",
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (!dateObj) return "";

  switch (format) {
    case "date":
      return dateObj.toLocaleDateString("cs-CZ");
    case "time":
      return dateObj.toLocaleTimeString("cs-CZ");
    case "datetime":
    default:
      return dateObj.toLocaleString("cs-CZ");
  }
}

export function formatDateForInput(date?: string | Date | null): string {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
