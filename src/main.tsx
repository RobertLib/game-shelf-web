import "./index.css";
import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  type FieldPolicy,
} from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { clearAuthAndRedirect, ensureValidToken } from "./lib/auth";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { createRoot } from "react-dom/client";
import { ErrorLink } from "@apollo/client/link/error";
import { SetContextLink } from "@apollo/client/link/context";
import { StrictMode } from "react";
import App from "./App";
import logger from "./utils/logger";

const errorLink = new ErrorLink(({ error }) => {
  if (CombinedGraphQLErrors.is(error)) {
    error.errors.forEach(({ message, locations, path, extensions }) => {
      logger.log(`[GraphQL error]: Message: ${message}, Path: ${path}`);
      logger.log("Location:", locations);

      if (
        extensions?.code === "UNAUTHENTICATED" ||
        extensions?.code === "UNAUTHORIZED"
      ) {
        logger.log("User authentication failed, redirecting to login");
        void clearAuthAndRedirect();
      }
    });
  } else {
    logger.error("[Network error]:", error);

    if (
      "statusCode" in error &&
      (error.statusCode === 401 || error.statusCode === 403)
    ) {
      logger.log("Network authentication error, redirecting to login");
      void clearAuthAndRedirect();
    }
  }
});

const httpLink = new HttpLink({
  uri: `${import.meta.env.VITE_API_URL}/graphql`,
});

const authLink = new SetContextLink(async (prevContext) => {
  const hasValidToken = await ensureValidToken();
  if (hasValidToken === false) {
    await clearAuthAndRedirect();
    throw new Error("Authentication failed");
  }

  const token = localStorage.getItem("token");

  return {
    headers: {
      ...prevContext.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

const detailField = (typenames: string | string[]): FieldPolicy => ({
  read(existing, { args, toReference, readField }) {
    if (existing) {
      return existing;
    }

    if (!args?.id) {
      return undefined;
    }

    const possibleTypenames = Array.isArray(typenames)
      ? typenames
      : [typenames];

    for (const typename of possibleTypenames) {
      const reference = toReference({
        __typename: typename,
        id: args.id,
      });

      if (reference && readField("id", reference) != null) {
        return reference;
      }
    }

    return undefined;
  },
});

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        user: detailField("User"),
      },
    },
  },
});

export const client = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>,
);
