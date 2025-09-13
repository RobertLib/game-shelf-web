import { formatDate } from "../../utils/date-format";

describe("date-format", () => {
  // Mock system time for consistent testing
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("formatDate", () => {
    it("should format a Date object to Czech locale string", () => {
      const date = new Date("2023-12-25T14:30:00.000Z");
      const result = formatDate(date);
      expect(result).toMatch(/25\.\s*12\.\s*2023/); // Czech format: DD. MM. YYYY
    });

    it("should format a string date to Czech locale string", () => {
      const dateString = "2023-12-25T14:30:00.000Z";
      const result = formatDate(dateString);
      expect(result).toMatch(/25\.\s*12\.\s*2023/); // Czech format
    });

    it("should return empty string for null", () => {
      const result = formatDate(null);
      expect(result).toBe("");
    });

    it("should return empty string for undefined", () => {
      const result = formatDate(undefined);
      expect(result).toBe("");
    });

    it("should return 'Invalid Date' for invalid date string", () => {
      const result = formatDate("invalid-date");
      expect(result).toBe("Invalid Date");
    });

    it("should return 'Invalid Date' for empty string", () => {
      const result = formatDate("");
      expect(result).toBe("Invalid Date");
    });

    it("should format ISO string correctly", () => {
      const isoString = "2023-01-15T10:00:00.000Z";
      const result = formatDate(isoString);
      expect(result).toMatch(/15\.\s*1\.\s*2023/);
    });
  });
});
