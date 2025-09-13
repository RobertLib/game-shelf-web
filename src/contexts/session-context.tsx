import { Authorization } from "../__generated__/graphql";
import { createContext, useEffect, useState } from "react";
import {
  forgotUserPassword,
  getSession,
  loginUser,
  logoutUser,
  registerUser,
  resetUserPassword,
  type AuthError,
  type User,
  verifyUserAccount,
} from "../lib/auth";
import { GET_AUTHORIZATION } from "../graphql/queries/authorization";
import { useQuery } from "@apollo/client/react";
import logger from "../utils/logger";

interface SessionContextType {
  authorization?: Partial<Authorization> | null;
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthError | null>;
  logout: () => void;
  register: (
    email: string,
    password: string,
    confirmPassword: string,
  ) => Promise<AuthError | null>;
  forgotPassword: (email: string) => Promise<AuthError | null>;
  resetPassword: (
    password: string,
    confirmPassword: string,
    token: string | null,
  ) => Promise<AuthError | null>;
  verifyAccount: (
    password: string,
    confirmPassword: string,
    token: string | null,
  ) => Promise<AuthError | null>;
}

const SessionContext = createContext<SessionContextType>({
  authorization: null,
  currentUser: null,
  isLoading: true,
  login: () => Promise.resolve(null),
  logout: () => {},
  register: () => Promise.resolve(null),
  forgotPassword: () => Promise.resolve(null),
  resetPassword: () => Promise.resolve(null),
  verifyAccount: () => Promise.resolve(null),
});

export const SessionProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getSession()
      .then((session) => {
        if (session?.user) {
          setCurrentUser(session.user);
        }
      })
      .catch((error) => {
        logger.error("Failed to get session:", error);
        setCurrentUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const { data: authorizationData } = useQuery(GET_AUTHORIZATION, {
    fetchPolicy: "no-cache",
    skip: !currentUser,
  });

  const login = async (email: string, password: string) => {
    const data = await loginUser(email, password);

    if (!data.success) {
      return data.error;
    }

    setCurrentUser(data.user);

    return null;
  };

  const logout = async () => {
    await logoutUser();
    setCurrentUser(null);
  };

  const register = async (
    email: string,
    password: string,
    confirmPassword: string,
  ) => {
    const data = await registerUser(email, password, confirmPassword);

    if (!data.success) {
      return data.error;
    }

    setCurrentUser(data.user);

    return null;
  };

  const forgotPassword = async (email: string) => {
    const data = await forgotUserPassword(email);

    if (!data.success) {
      return data.error;
    }

    return null;
  };

  const resetPassword = async (
    password: string,
    confirmPassword: string,
    token: string | null,
  ) => {
    const data = await resetUserPassword(password, confirmPassword, token);

    if (!data.success) {
      return data.error;
    }

    return null;
  };

  const verifyAccount = async (
    password: string,
    confirmPassword: string,
    token: string | null,
  ) => {
    const data = await verifyUserAccount(password, confirmPassword, token);

    if (!data.success) {
      return data.error;
    }

    return null;
  };

  return (
    <SessionContext
      value={{
        authorization: authorizationData?.authorization ?? null,
        currentUser,
        isLoading,
        login,
        logout,
        register,
        forgotPassword,
        resetPassword,
        verifyAccount,
      }}
    >
      {children}
    </SessionContext>
  );
};

export default SessionContext;
