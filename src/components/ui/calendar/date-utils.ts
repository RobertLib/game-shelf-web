export const locales = "cs-CZ";

export const formatDate = (
  date?: Date | string | null,
  format?: "date" | "time" | "input",
): string => {
  if (!date) {
    return "";
  }

  const parsedDate = typeof date === "string" ? new Date(date) : date;

  if (format === "date") {
    return parsedDate.toLocaleDateString(locales, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  if (format === "time") {
    return parsedDate.toLocaleTimeString(locales, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (format === "input") {
    const day = parsedDate.getDate().toString().padStart(2, "0");
    const month = (parsedDate.getMonth() + 1).toString().padStart(2, "0");
    const year = parsedDate.getFullYear();

    return `${year}-${month}-${day}`;
  }

  return parsedDate.toLocaleString(locales, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatTime = (hours: number, minutes: number = 0): string => {
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

export const formatMonth = (date: Date): string => {
  return new Intl.DateTimeFormat(locales, {
    month: "long",
    year: "numeric",
  }).format(date);
};

export const getWeekStartEnd = (date: Date): { start: Date; end: Date } => {
  const start = new Date(date);
  start.setDate(
    start.getDate() - start.getDay() + (start.getDay() === 0 ? -6 : 1),
  );

  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  return { start, end };
};

export const formatWeekRange = (date: Date): string => {
  const { start, end } = getWeekStartEnd(date);
  return `${formatDate(start, "date")} - ${formatDate(end, "date")}`;
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};
