import { DrawerProvider } from "../contexts/drawer-context";
import {
  MockedProvider,
  type MockedProviderProps,
} from "@apollo/client/testing/react";
import { MockLink } from "@apollo/client/testing";
import { render, type RenderOptions } from "@testing-library/react";
import { SessionProvider } from "../contexts/session-context";
import { SnackbarProvider } from "../contexts/snackbar-context";
import { type ReactElement, type ReactNode } from "react";

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  mocks?: MockLink.MockedResponse[];
  apolloOptions?: Partial<Omit<MockedProviderProps, "mocks" | "children">>;
}

export const renderWithProviders = (
  ui: ReactElement,
  { mocks = [], apolloOptions, ...renderOptions }: CustomRenderOptions = {},
) => {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MockedProvider mocks={mocks} {...apolloOptions}>
        <SessionProvider>
          <SnackbarProvider>
            <DrawerProvider>{children}</DrawerProvider>
          </SnackbarProvider>
        </SessionProvider>
      </MockedProvider>
    );
  }

  const result = render(ui, { wrapper: Wrapper, ...renderOptions });

  (globalThis as Record<string, unknown>).rerenderWithProviders = (
    element: ReactElement,
  ) => result.rerender(element);

  return {
    ...result,
    rerenderWithProviders: (element: ReactElement) => result.rerender(element),
  };
};

export const rerenderWithProviders = (element: ReactElement) => {
  const fn = (globalThis as Record<string, unknown>).rerenderWithProviders as (
    element: ReactElement,
  ) => void;
  if (!fn) {
    throw new Error(
      "rerenderWithProviders must be called after renderWithProviders",
    );
  }
  return fn(element);
};

// eslint-disable-next-line react-refresh/only-export-components
export * from "@testing-library/react";
