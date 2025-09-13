import { act, renderHook, waitFor } from "../../../test-utils";
import { mockLocalStorage } from "../../../setup";
import { use } from "react";
import logger from "../../../../utils/logger";
import SessionContext from "../../../../contexts/session-context";
import useTableState from "../../../../components/ui/data-table/use-table-state";

vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    use: vi.fn().mockImplementation((context) => {
      if (context === SessionContext) {
        return { currentUser: { email: "test@example.com" }, isLoading: false };
      }
      return undefined;
    }),
  };
});

vi.mock("../../../../utils/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

describe("useTableState Hook", () => {
  const defaultState = {
    columnOrder: ["name", "email", "role"],
    columnVisibility: { name: true, email: true, role: true },
    pinnedColumns: { left: [], right: [] },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();

    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });
  });

  it("returns default state when no saved state exists", () => {
    const { result } = renderHook(() =>
      useTableState("users-table", defaultState),
    );

    expect(result.current[0]).toEqual(defaultState);
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
      "table-state-test@example.com-users-table",
    );
  });

  it("loads state from localStorage when available", async () => {
    const savedState = {
      columnOrder: ["role", "name", "email"],
      columnVisibility: { name: true, email: false, role: true },
      pinnedColumns: { left: ["role"], right: [] },
    };

    mockLocalStorage.setItem(
      "table-state-test@example.com-users-table",
      JSON.stringify(savedState),
    );

    const { result } = renderHook(() =>
      useTableState("users-table", defaultState),
    );

    await waitFor(() => expect(result.current[0]).toEqual(savedState));
  });

  it("saves state to localStorage when updated", async () => {
    const { result } = renderHook(() =>
      useTableState("users-table", defaultState),
    );

    // Wait for initialization
    await waitFor(() => expect(result.current[0]).toBeDefined());

    const newState = {
      columnVisibility: { name: false, email: true, role: true },
    };

    act(() => {
      result.current[1](newState);
    });

    await waitFor(() => {
      expect(result.current[0].columnVisibility).toEqual(
        newState.columnVisibility,
      );
    });

    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "table-state-test@example.com-users-table",
        expect.any(String),
      );
    });

    const savedJSON = mockLocalStorage.setItem.mock.calls[0][1];
    const savedState = JSON.parse(savedJSON);
    expect(savedState.columnVisibility).toEqual(newState.columnVisibility);
  });

  it("removes state from localStorage when reset to default", async () => {
    const { result } = renderHook(() =>
      useTableState("users-table", defaultState),
    );

    // Wait for initialization
    await waitFor(() => expect(result.current[0]).toBeDefined());

    act(() => {
      result.current[1]({
        columnVisibility: { name: false, email: true, role: true },
      });
    });

    await waitFor(() => {
      expect(result.current[0].columnVisibility).toEqual({
        name: false,
        email: true,
        role: true,
      });
    });

    act(() => {
      result.current[1]({
        columnOrder: defaultState.columnOrder,
        columnVisibility: defaultState.columnVisibility,
        pinnedColumns: defaultState.pinnedColumns,
      });
    });

    await waitFor(() => {
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "table-state-test@example.com-users-table",
      );
    });
  });

  it("uses 'anonymous' as userIdentifier when no user is logged in", async () => {
    vi.mocked(use).mockImplementation((context) => {
      if (context === SessionContext) {
        return { currentUser: null, isLoading: false };
      }
      return undefined;
    });

    const { result } = renderHook(() =>
      useTableState("users-table", defaultState),
    );

    // Wait for initialization
    await waitFor(() => expect(result.current[0]).toBeDefined());

    act(() => {
      result.current[1]({
        columnVisibility: { name: false, email: true, role: true },
      });
    });

    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "table-state-anonymous-users-table",
        expect.any(String),
      );
    });
  });

  it("does not use localStorage when tableId is undefined", () => {
    const { result } = renderHook(() => useTableState(undefined, defaultState));

    act(() => {
      result.current[1]({
        columnVisibility: { name: false, email: true, role: true },
      });
    });

    expect(result.current[0].columnVisibility).toEqual({
      name: false,
      email: true,
      role: true,
    });
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
  });

  it("logs error when localStorage operations fail", async () => {
    mockLocalStorage.getItem.mockImplementationOnce(() => {
      throw new Error("Storage error");
    });

    renderHook(() => useTableState("users-table", defaultState));

    await waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith(
        "Failed to load table state from localStorage",
        expect.any(Error),
      );
    });

    const { result } = renderHook(() =>
      useTableState("users-table", defaultState),
    );

    // Wait for initialization
    await waitFor(() => expect(result.current[0]).toBeDefined());

    mockLocalStorage.setItem.mockImplementationOnce(() => {
      throw new Error("Storage error");
    });

    act(() => {
      result.current[1]({
        columnVisibility: { name: false, email: true, role: true },
      });
    });

    await waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith(
        "Failed to save table state to localStorage",
        expect.any(Error),
      );
    });
  });

  it("handles invalid JSON in localStorage", () => {
    mockLocalStorage.getItem.mockReturnValueOnce("invalid-json");

    renderHook(() => useTableState("users-table", defaultState));

    expect(logger.error).toHaveBeenCalled();

    const { result } = renderHook(() =>
      useTableState("users-table", defaultState),
    );
    expect(result.current[0]).toEqual(defaultState);
  });
});
