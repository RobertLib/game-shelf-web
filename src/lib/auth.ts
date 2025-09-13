import { isTokenExpired } from "../utils/jwt";
import EncryptionService from "../utils/encryption";
import logger from "../utils/logger";

export interface User {
  id: number;
  email: string;
  role: string;
}

export interface AuthError {
  error: string;
  "field-error"?: [string, string];
}

export const getSession = async (): Promise<{ user: User } | null> => {
  try {
    const encryptedSession = localStorage.getItem("session");
    if (!encryptedSession) return null;

    const decryptedData = await EncryptionService.decrypt(encryptedSession);
    if (!decryptedData) return null;

    return JSON.parse(decryptedData);
  } catch (error) {
    logger.error("Error parsing session from localStorage", error);
    return null;
  }
};

export const saveSession = async (data: {
  accessToken: string;
  refreshToken: string;
  user: User;
}) => {
  try {
    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);

    const sessionData = JSON.stringify({ user: data.user });
    const encryptedData = await EncryptionService.encrypt(sessionData);
    localStorage.setItem("session", encryptedData);
  } catch (error) {
    logger.error("Error saving encrypted session", error);
  }
};

export const loginUser = async (email: string, password: string) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    return { success: false, error: data };
  }

  await saveSession(data);

  return { success: true, user: data.user };
};

export const logoutUser = async () => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      logger.error("Error logging out", error);
    }
  }

  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("session");

  // Clear Apollo cache to prevent data leakage between users
  try {
    const { client } = await import("../main");
    await client.clearStore();
  } catch (error) {
    logger.error("Error clearing Apollo cache", error);
  }
};

export const registerUser = async (
  email: string,
  password: string,
  confirmPassword: string,
) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        confirmPassword,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    return { success: false, error: data };
  }

  await saveSession(data);

  return { success: true, user: data.user };
};

export const forgotUserPassword = async (email: string) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/auth/reset-password-request`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    return { success: false, error: data };
  }

  return { success: true };
};

export const resetUserPassword = async (
  password: string,
  confirmPassword: string,
  token: string | null,
) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/auth/reset-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password,
        confirmPassword,
        key: token,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    return { success: false, error: data };
  }

  return { success: true };
};

export const verifyUserAccount = async (
  password: string,
  confirmPassword: string,
  token: string | null,
) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/auth/verify-account`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password,
        confirmPassword,
        key: token,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    return { success: false, error: data };
  }

  return { success: true };
};

let refreshPromise: Promise<boolean> | null = null;

export const ensureValidToken = async (): Promise<boolean | null> => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  if (!isTokenExpired(token)) return true;

  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return false;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/jwt-refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ refreshToken }),
        },
      );

      if (!response.ok) return false;

      const data = await response.json();
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      return true;
    } catch (error) {
      logger.error("Error refreshing token:", error);
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export const clearAuthAndRedirect = async () => {
  if (
    localStorage.getItem("token") ||
    localStorage.getItem("refreshToken") ||
    localStorage.getItem("session")
  ) {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("session");

    // Clear Apollo cache to prevent data leakage between users
    try {
      const { client } = await import("../main");
      await client.clearStore();
    } catch (error) {
      logger.error("Error clearing Apollo cache", error);
    }

    window.location.href = "/login";
  }
};
