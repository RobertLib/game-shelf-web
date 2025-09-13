import { isTokenExpired, jwtDecode } from "../../utils/jwt";
import logger from "../../utils/logger";

vi.mock("../../utils/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

describe("JWT utility functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("jwtDecode", () => {
    it("should decode a valid JWT token", () => {
      // Valid JWT token with payload: {"sub": "1234567890", "name": "John Doe", "iat": 1516239022}
      const validToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

      const decoded = jwtDecode(validToken);

      expect(decoded).toEqual({
        sub: "1234567890",
        name: "John Doe",
        iat: 1516239022,
      });
    });

    it("should decode JWT with typed payload", () => {
      interface CustomPayload {
        userId: string;
        role: string;
        exp: number;
      }

      // Token with payload: {"userId": "123", "role": "admin", "exp": 1700000000}
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJyb2xlIjoiYWRtaW4iLCJleHAiOjE3MDAwMDAwMDB9.mock-signature";

      const decoded = jwtDecode<CustomPayload>(token);

      expect(decoded).toEqual({
        userId: "123",
        role: "admin",
        exp: 1700000000,
      });
    });

    it("should return null for invalid JWT format - wrong number of parts", () => {
      const invalidToken = "invalid.token";

      const decoded = jwtDecode(invalidToken);

      expect(decoded).toBeNull();
      expect(logger.error).toHaveBeenCalledWith("Invalid JWT format");
    });

    it("should return null for invalid JWT format - too many parts", () => {
      const invalidToken = "header.payload.signature.extra";

      const decoded = jwtDecode(invalidToken);

      expect(decoded).toBeNull();
      expect(logger.error).toHaveBeenCalledWith("Invalid JWT format");
    });

    it("should return null for invalid base64 encoding", () => {
      const invalidToken = "header.invalid-base64.signature";

      const decoded = jwtDecode(invalidToken);

      expect(decoded).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(
        "Error decoding JWT:",
        expect.any(Error),
      );
    });

    it("should return null for invalid JSON in payload", () => {
      // Token with invalid JSON payload (missing quotes)
      const invalidToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.aW52YWxpZEpTT04.signature";

      const decoded = jwtDecode(invalidToken);

      expect(decoded).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(
        "Error decoding JWT:",
        expect.any(Error),
      );
    });

    it("should handle empty string token", () => {
      const decoded = jwtDecode("");

      expect(decoded).toBeNull();
      expect(logger.error).toHaveBeenCalledWith("Invalid JWT format");
    });

    it("should handle special characters in payload", () => {
      // Token with payload containing special characters: {"name": "Jan Nový", "city": "Praha"}
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSmFuIE5vdsO9IiwiY2l0eSI6IlByYWhhIn0.mock-signature";

      const decoded = jwtDecode(token);

      expect(decoded).toEqual({
        name: "Jan Nový",
        city: "Praha",
      });
    });
  });

  describe("isTokenExpired", () => {
    const currentTimestamp = 1700000000;

    beforeEach(() => {
      vi.setSystemTime(currentTimestamp * 1000);
    });

    it("should return false for non-expired token", () => {
      const futureExp = currentTimestamp + 3600;
      const token = createMockToken({ exp: futureExp });

      const isExpired = isTokenExpired(token);

      expect(isExpired).toBe(false);
    });

    it("should return true for expired token", () => {
      const pastExp = currentTimestamp - 3600;
      const token = createMockToken({ exp: pastExp });

      const isExpired = isTokenExpired(token);

      expect(isExpired).toBe(true);
    });

    it("should return true for token expiring within 30 seconds (buffer)", () => {
      const soonExp = currentTimestamp + 15;
      const token = createMockToken({ exp: soonExp });

      const isExpired = isTokenExpired(token);

      expect(isExpired).toBe(true);
    });

    it("should return false for token expiring after 30 second buffer", () => {
      const laterExp = currentTimestamp + 45;
      const token = createMockToken({ exp: laterExp });

      const isExpired = isTokenExpired(token);

      expect(isExpired).toBe(false);
    });

    it("should return true for token without exp claim", () => {
      const token = createMockToken({ sub: "123" });

      const isExpired = isTokenExpired(token);

      expect(isExpired).toBe(true);
    });

    it("should return true for invalid token", () => {
      const invalidToken = "invalid.token";

      const isExpired = isTokenExpired(invalidToken);

      expect(isExpired).toBe(true);
    });

    it("should return true for token that fails to decode", () => {
      const invalidToken = "header.invalid-payload.signature";

      const isExpired = isTokenExpired(invalidToken);

      expect(isExpired).toBe(true);
    });

    it("should return true for empty token", () => {
      const isExpired = isTokenExpired("");

      expect(isExpired).toBe(true);
    });

    it("should handle edge case where exp equals current time + 30", () => {
      const exactExp = currentTimestamp + 30;
      const token = createMockToken({ exp: exactExp });

      const isExpired = isTokenExpired(token);

      expect(isExpired).toBe(true);
    });
  });

  function createMockToken(payload: Record<string, unknown>): string {
    const header = { alg: "HS256", typ: "JWT" };
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));

    return `${encodedHeader}.${encodedPayload}.mock-signature`;
  }
});
