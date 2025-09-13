import {
  clearAuthAndRedirect,
  ensureValidToken,
  forgotUserPassword,
  getSession,
  loginUser,
  logoutUser,
  registerUser,
  resetUserPassword,
  saveSession,
  type User,
} from "../../lib/auth";
import { isTokenExpired } from "../../utils/jwt";
import { MockInstance } from "vitest";
import EncryptionService from "../../utils/encryption";
import logger from "../../utils/logger";

vi.mock("../../utils/jwt");
vi.mock("../../utils/encryption");
vi.mock("../../utils/logger");
vi.mock("../../main", () => ({
  client: {
    clearStore: vi.fn().mockResolvedValue(undefined),
  },
}));

const mockIsTokenExpired = vi.mocked(isTokenExpired);
const mockEncryptionService = vi.mocked(EncryptionService);
const mockLogger = vi.mocked(logger);

global.fetch = vi.fn();

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

const mockLocation = {
  href: "",
};
Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

vi.stubEnv("VITE_API_URL", "http://localhost:3000");

describe("Auth utility functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockReturnValue(undefined);
    mockLocalStorage.removeItem.mockReturnValue(undefined);
    mockEncryptionService.encrypt.mockResolvedValue("encrypted-data");
    mockEncryptionService.decrypt.mockResolvedValue(null);
    mockLocation.href = "";
  });

  describe("getSession", () => {
    it("should return null when no session exists", async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = await getSession();

      expect(result).toBeNull();
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("session");
    });

    it("should return null when session cannot be decrypted", async () => {
      mockLocalStorage.getItem.mockReturnValue("encrypted-session");
      mockEncryptionService.decrypt.mockResolvedValue(null);

      const result = await getSession();

      expect(result).toBeNull();
      expect(mockEncryptionService.decrypt).toHaveBeenCalledWith(
        "encrypted-session",
      );
    });

    it("should return parsed user data when session is valid", async () => {
      const userData = {
        user: { id: 1, email: "test@example.com", role: "user" },
      };
      mockLocalStorage.getItem.mockReturnValue("encrypted-session");
      mockEncryptionService.decrypt.mockResolvedValue(JSON.stringify(userData));

      const result = await getSession();

      expect(result).toEqual(userData);
      expect(mockEncryptionService.decrypt).toHaveBeenCalledWith(
        "encrypted-session",
      );
    });

    it("should handle JSON parsing errors", async () => {
      mockLocalStorage.getItem.mockReturnValue("encrypted-session");
      mockEncryptionService.decrypt.mockResolvedValue("invalid-json");

      const result = await getSession();

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error parsing session from localStorage",
        expect.any(Error),
      );
    });

    it("should handle encryption service errors", async () => {
      mockLocalStorage.getItem.mockReturnValue("encrypted-session");
      mockEncryptionService.decrypt.mockRejectedValue(
        new Error("Decryption failed"),
      );

      const result = await getSession();

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error parsing session from localStorage",
        expect.any(Error),
      );
    });
  });

  describe("saveSession", () => {
    it("should save tokens and encrypted session data", async () => {
      const sessionData = {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
        user: { id: 1, email: "test@example.com", role: "user" } as User,
      };

      await saveSession(sessionData);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "token",
        "accessToken",
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "refreshToken",
        "refreshToken",
      );
      expect(mockEncryptionService.encrypt).toHaveBeenCalledWith(
        JSON.stringify({ user: sessionData.user }),
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "session",
        "encrypted-data",
      );
    });

    it("should handle encryption errors gracefully", async () => {
      const sessionData = {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
        user: { id: 1, email: "test@example.com", role: "user" } as User,
      };
      mockEncryptionService.encrypt.mockRejectedValue(
        new Error("Encryption failed"),
      );

      await saveSession(sessionData);

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error saving encrypted session",
        expect.any(Error),
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "token",
        "accessToken",
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "refreshToken",
        "refreshToken",
      );
    });
  });

  describe("loginUser", () => {
    it("should login user successfully", async () => {
      const responseData = {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
        user: { id: 1, email: "test@example.com", role: "user" },
      };

      (global.fetch as unknown as MockInstance).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(responseData),
      });

      const result = await loginUser("test@example.com", "password");

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            password: "password",
          }),
        },
      );
      expect(result).toEqual({ success: true, user: responseData.user });
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "token",
        "accessToken",
      );
    });

    it("should handle login errors", async () => {
      const errorResponse = { error: "Invalid credentials" };

      (global.fetch as unknown as MockInstance).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve(errorResponse),
      });

      const result = await loginUser("test@example.com", "wrong-password");

      expect(result).toEqual({ success: false, error: errorResponse });
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe("logoutUser", () => {
    it("should logout user and clear storage", async () => {
      mockLocalStorage.getItem.mockReturnValue("accessToken");
      (global.fetch as unknown as MockInstance).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const { client } = await import("../../main");

      await logoutUser();

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/auth/logout",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer accessToken",
            "Content-Type": "application/json",
          },
        },
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("token");
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("refreshToken");
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("session");
      expect(client.clearStore).toHaveBeenCalled();
    });

    it("should clear storage even when API call fails", async () => {
      mockLocalStorage.getItem.mockReturnValue("accessToken");
      (global.fetch as unknown as MockInstance).mockRejectedValue(
        new Error("Network error"),
      );

      const { client } = await import("../../main");

      await logoutUser();

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error logging out",
        expect.any(Error),
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("token");
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("refreshToken");
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("session");
      expect(client.clearStore).toHaveBeenCalled();
    });

    it("should clear storage when no token exists", async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { client } = await import("../../main");

      await logoutUser();

      expect(global.fetch).not.toHaveBeenCalled();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("token");
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("refreshToken");
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("session");
      expect(client.clearStore).toHaveBeenCalled();
    });

    it("should clear Apollo cache to prevent data leakage", async () => {
      mockLocalStorage.getItem.mockReturnValue("access-token");
      (global.fetch as unknown as MockInstance).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const { client } = await import("../../main");

      await logoutUser();

      expect(client.clearStore).toHaveBeenCalledTimes(1);
    });
  });

  describe("registerUser", () => {
    it("should register user successfully", async () => {
      const responseData = {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
        user: { id: 1, email: "test@example.com", role: "user" },
      };

      (global.fetch as unknown as MockInstance).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(responseData),
      });

      const result = await registerUser(
        "test@example.com",
        "password",
        "password",
      );

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            password: "password",
            confirmPassword: "password",
          }),
        },
      );
      expect(result).toEqual({ success: true, user: responseData.user });
    });

    it("should handle registration errors", async () => {
      const errorResponse = { error: "E-mail already exists" };

      (global.fetch as unknown as MockInstance).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve(errorResponse),
      });

      const result = await registerUser(
        "test@example.com",
        "password",
        "password",
      );

      expect(result).toEqual({ success: false, error: errorResponse });
    });
  });

  describe("forgotUserPassword", () => {
    it("should send forgot password request successfully", async () => {
      (global.fetch as unknown as MockInstance).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const result = await forgotUserPassword("test@example.com");

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/auth/reset-password-request",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "test@example.com" }),
        },
      );
      expect(result).toEqual({ success: true });
    });

    it("should handle forgot password errors", async () => {
      const errorResponse = { error: "E-mail not found" };

      (global.fetch as unknown as MockInstance).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve(errorResponse),
      });

      const result = await forgotUserPassword("test@example.com");

      expect(result).toEqual({ success: false, error: errorResponse });
    });
  });

  describe("resetUserPassword", () => {
    it("should reset password successfully", async () => {
      (global.fetch as unknown as MockInstance).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const result = await resetUserPassword(
        "newpassword",
        "newpassword",
        "reset-token",
      );

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password: "newpassword",
            confirmPassword: "newpassword",
            key: "reset-token",
          }),
        },
      );
      expect(result).toEqual({ success: true });
    });

    it("should handle reset password errors", async () => {
      const errorResponse = { error: "Invalid reset token" };

      (global.fetch as unknown as MockInstance).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve(errorResponse),
      });

      const result = await resetUserPassword(
        "newpassword",
        "newpassword",
        "invalid-token",
      );

      expect(result).toEqual({ success: false, error: errorResponse });
    });
  });

  describe("ensureValidToken", () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it("should return null when no token exists", async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = await ensureValidToken();

      expect(result).toBe(null);
      expect(mockIsTokenExpired).not.toHaveBeenCalled();
    });

    it("should return true when token is not expired", async () => {
      mockLocalStorage.getItem.mockReturnValue("valid-token");
      mockIsTokenExpired.mockReturnValue(false);

      const result = await ensureValidToken();

      expect(result).toBe(true);
      expect(mockIsTokenExpired).toHaveBeenCalledWith("valid-token");
    });

    it("should refresh token when expired and refresh token exists", async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === "token") return "expired-token";
        if (key === "refreshToken") return "refreshToken";
        return null;
      });
      mockIsTokenExpired.mockReturnValue(true);

      const refreshResponse = {
        accessToken: "new-accessToken",
        refreshToken: "new-refreshToken",
      };

      (global.fetch as unknown as MockInstance).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(refreshResponse),
      });

      const result = await ensureValidToken();

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/auth/jwt-refresh",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer expired-token",
          },
          body: JSON.stringify({ refreshToken: "refreshToken" }),
        },
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "token",
        "new-accessToken",
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "refreshToken",
        "new-refreshToken",
      );
    });

    it("should return false when refresh token fails", async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === "token") return "expired-token";
        if (key === "refreshToken") return "refreshToken";
        return null;
      });
      mockIsTokenExpired.mockReturnValue(true);

      (global.fetch as unknown as MockInstance).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({}),
      });

      const result = await ensureValidToken();

      expect(result).toBe(false);
    });

    it("should return false when no refresh token exists", async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === "token") return "expired-token";
        return null;
      });
      mockIsTokenExpired.mockReturnValue(true);

      const result = await ensureValidToken();

      expect(result).toBe(false);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should handle refresh token network errors", async () => {
      vi.clearAllMocks();
      vi.resetModules();

      const { ensureValidToken: freshEnsureValidToken } = await import(
        "../../lib/auth"
      );

      const mockError = vi.fn();
      mockLogger.error = mockError;

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === "token") return "expired-token";
        if (key === "refreshToken") return "refreshToken";
        return null;
      });
      mockIsTokenExpired.mockReturnValue(true);

      const error = new Error("Network error");
      const fetchMock = vi.fn().mockRejectedValue(error);
      global.fetch = fetchMock;

      const result = await freshEnsureValidToken();

      expect(result).toBe(false);
      expect(fetchMock).toHaveBeenCalled();
      expect(mockError).toHaveBeenCalledWith("Error refreshing token:", error);
    });

    it("should handle concurrent refresh requests", async () => {
      vi.clearAllMocks();
      vi.resetModules();

      const { ensureValidToken: freshEnsureValidToken } = await import(
        "../../lib/auth"
      );

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === "token") return "expired-token";
        if (key === "refreshToken") return "refreshToken";
        return null;
      });
      mockIsTokenExpired.mockReturnValue(true);

      const refreshResponse = {
        accessToken: "new-accessToken",
        refreshToken: "new-refreshToken",
      };

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(refreshResponse),
      });
      global.fetch = fetchMock;

      const promise1 = freshEnsureValidToken();
      const promise2 = freshEnsureValidToken();

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("clearAuthAndRedirect", () => {
    it("should clear auth data and redirect when tokens exist", async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === "token") return "token";
        if (key === "refreshToken") return "refreshToken";
        if (key === "session") return "session";
        return null;
      });

      const { client } = await import("../../main");

      await clearAuthAndRedirect();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("token");
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("refreshToken");
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("session");
      expect(client.clearStore).toHaveBeenCalled();
      expect(mockLocation.href).toBe("/login");
    });

    it("should not redirect when no auth data exists", async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      await clearAuthAndRedirect();

      expect(mockLocation.href).toBe("");
    });

    it("should redirect when only token exists", async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === "token") return "token";
        return null;
      });

      const { client } = await import("../../main");

      await clearAuthAndRedirect();

      expect(client.clearStore).toHaveBeenCalled();
      expect(mockLocation.href).toBe("/login");
    });

    it("should redirect when only refresh token exists", async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === "refreshToken") return "refreshToken";
        return null;
      });

      const { client } = await import("../../main");

      await clearAuthAndRedirect();

      expect(client.clearStore).toHaveBeenCalled();
      expect(mockLocation.href).toBe("/login");
    });

    it("should redirect when only session exists", async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === "session") return "session";
        return null;
      });

      const { client } = await import("../../main");

      await clearAuthAndRedirect();

      expect(client.clearStore).toHaveBeenCalled();
      expect(mockLocation.href).toBe("/login");
    });
  });
});
