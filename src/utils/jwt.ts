import logger from "./logger";

export function jwtDecode<T = unknown>(token: string): T | null {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      logger.error("Invalid JWT format");
      return null;
    }

    const payload = parts[1];
    const decodedPayload = JSON.parse(decodeBase64Url(payload));

    return decodedPayload as T;
  } catch (error) {
    logger.error("Error decoding JWT:", error);
    return null;
  }
}

function decodeBase64Url(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const decoded = atob(base64);

  return decodeURIComponent(
    Array.from(decoded)
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join(""),
  );
}

interface JwtPayload {
  exp: number;
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);

    return decoded.exp <= currentTime + 30;
  } catch {
    return true;
  }
};
