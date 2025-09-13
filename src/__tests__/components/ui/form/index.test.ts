import * as apolloErrors from "@apollo/client/errors";
import { getFieldError } from "../../../../components/ui/form";

// Mock the CombinedGraphQLErrors.is function to return true for our test objects
const mockIs = vi.fn(
  (error: unknown): error is apolloErrors.CombinedGraphQLErrors => {
    return Boolean(error && typeof error === "object" && "errors" in error);
  },
);

vi.spyOn(apolloErrors.CombinedGraphQLErrors, "is").mockImplementation(mockIs);

// Helper function to create a mock error
const createMockGraphQLError = (extensions: Record<string, unknown>) => {
  return {
    errors: [
      {
        message: "Mock error",
        extensions,
      },
    ],
  };
};

describe("getFieldError", () => {
  it("should return undefined for non-GraphQL errors", () => {
    const error = new Error("Some error");
    expect(getFieldError(error, "fieldName")).toBeUndefined();
  });

  it("should return undefined for errors without extensions", () => {
    const error = createMockGraphQLError({});
    expect(getFieldError(error, "fieldName")).toBeUndefined();
  });

  describe("problems format (new)", () => {
    it("should return error for exact path match", () => {
      const error = createMockGraphQLError({
        problems: [
          {
            path: ["profile", "cooperationForm"],
            explanation:
              'Expected "test" to be one of: employee, self_employed',
          },
        ],
      });

      expect(getFieldError(error, "profile.cooperationForm")).toBe(
        'Expected "test" to be one of: employee, self_employed',
      );
    });

    it("should return error for camelCase to snake_case conversion", () => {
      const error = createMockGraphQLError({
        problems: [
          {
            path: ["first_name"],
            explanation: "First name is required",
          },
        ],
      });

      expect(getFieldError(error, "firstName")).toBe("First name is required");
    });

    it("should return error for snake_case to camelCase conversion", () => {
      const error = createMockGraphQLError({
        problems: [
          {
            path: ["lastName"],
            explanation: "Last name is required",
          },
        ],
      });

      expect(getFieldError(error, "last_name")).toBe("Last name is required");
    });

    it("should return undefined for non-matching paths", () => {
      const error = createMockGraphQLError({
        problems: [
          {
            path: ["profile", "cooperationForm"],
            explanation: "Some error",
          },
        ],
      });

      expect(getFieldError(error, "profile.phone")).toBeUndefined();
    });

    it("should handle nested paths correctly", () => {
      const error = createMockGraphQLError({
        problems: [
          {
            path: ["profile", "billingAddress", "street"],
            explanation: "Street is required",
          },
        ],
      });

      expect(getFieldError(error, "profile.billingAddress.street")).toBe(
        "Street is required",
      );
    });

    it("should handle multiple problems and return the first matching one", () => {
      const error = createMockGraphQLError({
        problems: [
          {
            path: ["email"],
            explanation: "Email is required",
          },
          {
            path: ["profile", "cooperationForm"],
            explanation: "Invalid cooperation form",
          },
        ],
      });

      expect(getFieldError(error, "email")).toBe("Email is required");
      expect(getFieldError(error, "profile.cooperationForm")).toBe(
        "Invalid cooperation form",
      );
    });
  });

  describe("legacy format (fallback)", () => {
    it("should return error for direct field match", () => {
      const error = createMockGraphQLError({
        email: ["Email is required"],
      });

      expect(getFieldError(error, "email")).toBe("Email is required");
    });

    it("should return error for snake_case field match", () => {
      const error = createMockGraphQLError({
        first_name: ["First name is required"],
      });

      expect(getFieldError(error, "firstName")).toBe("First name is required");
    });

    it("should return error for camelCase field match", () => {
      const error = createMockGraphQLError({
        lastName: ["Last name is required"],
      });

      expect(getFieldError(error, "last_name")).toBe("Last name is required");
    });

    it("should return undefined for non-existing field", () => {
      const error = createMockGraphQLError({
        email: ["Email is required"],
      });

      expect(getFieldError(error, "nonExistentField")).toBeUndefined();
    });
  });

  describe("mixed scenarios", () => {
    it("should prioritize problems format over legacy format", () => {
      const error = createMockGraphQLError({
        problems: [
          {
            path: ["email"],
            explanation: "New format error",
          },
        ],
        email: ["Legacy format error"],
      });

      expect(getFieldError(error, "email")).toBe("New format error");
    });

    it("should fallback to legacy format when problems don't match", () => {
      const error = createMockGraphQLError({
        problems: [
          {
            path: ["differentField"],
            explanation: "Different field error",
          },
        ],
        email: ["Legacy format error"],
      });

      expect(getFieldError(error, "email")).toBe("Legacy format error");
    });
  });
});
