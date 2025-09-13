import "@testing-library/jest-dom";
import { type LinkProps } from "react-router";

vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useId: () => "test-id",
  };
});

vi.mock("react-router", () => ({
  Link: ({ children, to, ...rest }: LinkProps) => (
    <a href={to.toString()} {...rest}>
      {children}
    </a>
  ),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="browser-router">{children}</div>
  ),
  Route: ({ element }: { element: React.ReactNode }) => (
    <div data-testid="route">{element}</div>
  ),
  Routes: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="routes">{children}</div>
  ),
  useLocation: () => ({ pathname: "/" }),
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));

export const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  const mockStorage = {
    getItem: vi.fn((key: string): string | null => store[key] || null),
    setItem: vi.fn((key: string, value: string): void => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string): void => {
      delete store[key];
    }),
    clear: vi.fn((): void => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number): string | null => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
  };

  return mockStorage;
})();

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = vi.fn((message: string, ...args: unknown[]) => {
    // Suppress specific errors
    if (
      typeof message === "string" &&
      (message.includes("act(...)") ||
        message.includes("No more mocked responses for the query"))
    ) {
      return;
    }
    // Let other errors through
    originalConsoleError(message, ...args);
  });

  console.warn = vi.fn((message: string, ...args: unknown[]) => {
    // Suppress specific warnings
    if (
      typeof message === "string" &&
      (message.includes("act(...)") ||
        message.includes("No more mocked responses for the query"))
    ) {
      return;
    }
    // Let other warnings through
    originalConsoleWarn(message, ...args);
  });
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
