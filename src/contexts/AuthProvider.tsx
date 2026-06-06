import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as api from "../api/client";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.login(email, password);
    if (!result.token) {
      throw new Error("Login failed: no token received.");
    }
    localStorage.setItem("token", result.token);
    setToken(result.token);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // ignore server error — always log out locally
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      queryClient.clear();
    }
  }, [queryClient]);

  return (
    <AuthContext value={{ token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext>
  );
}
