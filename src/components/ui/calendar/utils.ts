export const getColorStyles = (color?: string) => {
  const bgStyles = {
    red: "bg-red-100 dark:bg-red-900/30",
    green: "bg-green-100 dark:bg-green-900/30",
    blue: "bg-blue-100 dark:bg-blue-900/30",
    yellow: "bg-yellow-100 dark:bg-yellow-900/30",
    primary: "bg-primary-100 dark:bg-primary-900/30",
  } as Record<string, string>;

  const textStyles = {
    red: "text-red-800 dark:text-red-200",
    green: "text-green-800 dark:text-green-200",
    blue: "text-blue-800 dark:text-blue-200",
    yellow: "text-yellow-800 dark:text-yellow-200",
    primary: "text-primary-800 dark:text-primary-200",
  } as Record<string, string>;

  const borderStyles = {
    red: "border-red-500",
    green: "border-green-500",
    blue: "border-blue-500",
    yellow: "border-yellow-500",
    primary: "border-primary-500",
  } as Record<string, string>;

  const colorKey =
    color && ["red", "green", "blue", "yellow"].includes(color)
      ? color
      : "primary";

  return [bgStyles[colorKey], textStyles[colorKey], borderStyles[colorKey]];
};
