import {
  formatDate,
  formatMonth,
  formatTime,
  formatWeekRange,
  getWeekStartEnd,
  isSameDay,
  isToday,
} from "../../../../components/ui/calendar/date-utils";

describe("Date Utils", () => {
  describe("formatDate", () => {
    it("should format date for input type", () => {
      const date = new Date(2025, 0, 15); // January 15, 2025
      const result = formatDate(date, "input");
      expect(result).toBe("2025-01-15");
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("should format date for display type", () => {
      const date = new Date(2025, 0, 15); // January 15, 2025
      const result = formatDate(date, "date");

      // The exact format depends on implementation, but should be a non-empty string
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
      expect(result).not.toBe("Invalid Date");
    });

    it("should handle different months", () => {
      const januaryDate = new Date(2025, 0, 15); // January 15, 2025
      const decemberDate = new Date(2025, 11, 25); // December 25, 2025

      const januaryResult = formatDate(januaryDate, "input");
      const decemberResult = formatDate(decemberDate, "input");

      expect(januaryResult).toBe("2025-01-15");
      expect(decemberResult).toBe("2025-12-25");
      expect(januaryResult).not.toBe(decemberResult);
    });

    it("should handle edge cases", () => {
      const leapYearDate = new Date(2024, 1, 29); // February 29, 2024 (leap year)
      const result = formatDate(leapYearDate, "input");

      expect(result).toBe("2024-02-29");
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("should format date for time type", () => {
      const date = new Date(2025, 0, 15, 14, 30, 0); // January 15, 2025, 14:30
      const result = formatDate(date, "time");

      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
      expect(result).toMatch(/^\d{1,2}:\d{2}$/); // Should match time format HH:MM
    });

    it("should format date without format (default)", () => {
      const date = new Date(2025, 0, 15, 14, 30, 0); // January 15, 2025, 14:30
      const result = formatDate(date);

      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
      expect(result).not.toBe("Invalid Date");
      // Default should include both date and time
      expect(result).toMatch(/\d/); // Should contain digits
    });

    it("should handle null and undefined dates", () => {
      expect(formatDate(null)).toBe("");
      expect(formatDate(undefined)).toBe("");
      expect(formatDate(null, "input")).toBe("");
      expect(formatDate(undefined, "date")).toBe("");
    });

    it("should handle string date input", () => {
      const dateString = "2025-01-15T14:30:00.000Z";
      const result = formatDate(dateString, "input");

      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("should handle invalid string date input", () => {
      const invalidDateString = "invalid-date";
      const result = formatDate(invalidDateString, "input");

      // Should handle invalid dates gracefully
      expect(typeof result).toBe("string");
    });

    it("should handle empty string date input", () => {
      const emptyString = "";
      const result = formatDate(emptyString, "input");

      expect(result).toBe("");
    });
  });

  describe("formatMonth", () => {
    it("should format month and year", () => {
      const date = new Date(2025, 0, 15); // January 2025
      const result = formatMonth(date);

      // Should contain both month and year information
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
      expect(result).toMatch(/2025/); // Should contain the year
      expect(result.toLowerCase()).toMatch(/led|jan/); // Should contain month (Czech or English)
    });

    it("should handle different months", () => {
      const januaryDate = new Date(2025, 0, 1); // January
      const decemberDate = new Date(2024, 11, 1); // December

      const januaryResult = formatMonth(januaryDate);
      const decemberResult = formatMonth(decemberDate);

      expect(januaryResult).not.toBe(decemberResult);
      expect(januaryResult).toMatch(/2025/);
      expect(decemberResult).toMatch(/2024/);
    });

    it("should format consecutive months differently", () => {
      const march = new Date(2025, 2, 1); // March
      const april = new Date(2025, 3, 1); // April

      const marchResult = formatMonth(march);
      const aprilResult = formatMonth(april);

      expect(marchResult).not.toBe(aprilResult);
      expect(marchResult).toMatch(/2025/);
      expect(aprilResult).toMatch(/2025/);
    });
  });

  describe("formatWeekRange", () => {
    it("should format week range", () => {
      const date = new Date(2025, 0, 15); // Some date in January 2025
      const result = formatWeekRange(date);

      // Should return a string representing week range
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
      expect(result).not.toBe("Invalid Date");

      // Should contain date information
      expect(result).toMatch(/\d/); // Should contain at least one digit
    });

    it("should handle dates at month boundaries", () => {
      const endOfMonth = new Date(2025, 0, 31); // January 31, 2025
      const startOfMonth = new Date(2025, 1, 1); // February 1, 2025

      const endResult = formatWeekRange(endOfMonth);
      const startResult = formatWeekRange(startOfMonth);

      expect(typeof endResult).toBe("string");
      expect(typeof startResult).toBe("string");
      expect(endResult.length).toBeGreaterThan(0);
      expect(startResult.length).toBeGreaterThan(0);
    });

    it("should handle different weeks", () => {
      const week1 = new Date(2025, 0, 6); // First week of January
      const week2 = new Date(2025, 0, 13); // Second week of January

      const result1 = formatWeekRange(week1);
      const result2 = formatWeekRange(week2);

      expect(result1).not.toBe(result2);
      expect(typeof result1).toBe("string");
      expect(typeof result2).toBe("string");
    });

    it("should handle year boundaries", () => {
      const endOfYear = new Date(2024, 11, 30); // December 30, 2024
      const startOfYear = new Date(2025, 0, 6); // January 6, 2025

      const endResult = formatWeekRange(endOfYear);
      const startResult = formatWeekRange(startOfYear);

      expect(typeof endResult).toBe("string");
      expect(typeof startResult).toBe("string");
      expect(endResult.length).toBeGreaterThan(0);
      expect(startResult.length).toBeGreaterThan(0);
    });
  });

  describe("formatTime", () => {
    it("should format time with hours and minutes", () => {
      const result = formatTime(14, 30);
      expect(result).toBe("14:30");
    });

    it("should format time with only hours (default minutes to 0)", () => {
      const result = formatTime(9);
      expect(result).toBe("09:00");
    });

    it("should pad single digit hours and minutes with zero", () => {
      const result = formatTime(5, 7);
      expect(result).toBe("05:07");
    });

    it("should handle midnight", () => {
      const result = formatTime(0, 0);
      expect(result).toBe("00:00");
    });

    it("should handle edge cases", () => {
      expect(formatTime(23, 59)).toBe("23:59");
      expect(formatTime(12, 0)).toBe("12:00");
    });

    it("should handle double digit hours correctly", () => {
      expect(formatTime(10, 15)).toBe("10:15");
      expect(formatTime(15)).toBe("15:00");
    });
  });

  describe("getWeekStartEnd", () => {
    it("should get week start and end for Monday", () => {
      const monday = new Date(2025, 0, 6); // Monday, January 6, 2025
      const { start, end } = getWeekStartEnd(monday);

      expect(start.getDay()).toBe(1); // Monday
      expect(end.getDay()).toBe(0); // Sunday
      expect(start.getDate()).toBe(6); // Same day (Monday)
      expect(end.getDate()).toBe(12); // Following Sunday
    });

    it("should get week start and end for Sunday", () => {
      const sunday = new Date(2025, 0, 5); // Sunday, January 5, 2025
      const { start, end } = getWeekStartEnd(sunday);

      expect(start.getDay()).toBe(1); // Monday
      expect(end.getDay()).toBe(0); // Sunday
      expect(start.getDate()).toBe(30); // Previous Monday (December 30, 2024)
      expect(end.getDate()).toBe(5); // Same day (Sunday)
    });

    it("should get week start and end for Wednesday", () => {
      const wednesday = new Date(2025, 0, 8); // Wednesday, January 8, 2025
      const { start, end } = getWeekStartEnd(wednesday);

      expect(start.getDay()).toBe(1); // Monday
      expect(end.getDay()).toBe(0); // Sunday
      expect(start.getDate()).toBe(6); // Monday of the same week
      expect(end.getDate()).toBe(12); // Sunday of the same week
    });

    it("should handle year boundaries", () => {
      const newYearDay = new Date(2025, 0, 1); // January 1, 2025 (Wednesday)
      const { start, end } = getWeekStartEnd(newYearDay);

      expect(start.getDay()).toBe(1); // Monday
      expect(end.getDay()).toBe(0); // Sunday
      // Start should be in previous year
      expect(start.getFullYear()).toBe(2024);
      expect(start.getMonth()).toBe(11); // December
    });
  });

  describe("isSameDay", () => {
    it("should return true for same date", () => {
      const date1 = new Date(2025, 0, 15, 10, 30);
      const date2 = new Date(2025, 0, 15, 18, 45);

      expect(isSameDay(date1, date2)).toBe(true);
    });

    it("should return false for different dates", () => {
      const date1 = new Date(2025, 0, 15);
      const date2 = new Date(2025, 0, 16);

      expect(isSameDay(date1, date2)).toBe(false);
    });

    it("should return false for different months", () => {
      const date1 = new Date(2025, 0, 15); // January
      const date2 = new Date(2025, 1, 15); // February

      expect(isSameDay(date1, date2)).toBe(false);
    });

    it("should return false for different years", () => {
      const date1 = new Date(2024, 0, 15);
      const date2 = new Date(2025, 0, 15);

      expect(isSameDay(date1, date2)).toBe(false);
    });

    it("should handle edge cases", () => {
      const date1 = new Date(2024, 1, 29); // Leap year February 29
      const date2 = new Date(2024, 1, 29, 23, 59, 59);

      expect(isSameDay(date1, date2)).toBe(true);
    });

    it("should handle month and year boundaries", () => {
      const endOfMonth = new Date(2025, 0, 31); // January 31
      const startOfNextMonth = new Date(2025, 1, 1); // February 1

      expect(isSameDay(endOfMonth, startOfNextMonth)).toBe(false);

      const endOfYear = new Date(2024, 11, 31); // December 31, 2024
      const startOfNewYear = new Date(2025, 0, 1); // January 1, 2025

      expect(isSameDay(endOfYear, startOfNewYear)).toBe(false);
    });
  });

  describe("isToday", () => {
    it("should return true for today's date", () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it("should return true for today with different time", () => {
      const now = new Date();
      const todayDifferentTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
      );
      expect(isToday(todayDifferentTime)).toBe(true);
    });

    it("should return false for yesterday", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });

    it("should return false for tomorrow", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isToday(tomorrow)).toBe(false);
    });
  });
});
