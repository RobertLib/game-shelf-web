import { use } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import logger from "../../../utils/logger";
import SessionContext from "../../../contexts/session-context";

export interface TableState {
  columnOrder: string[];
  columnVisibility: Record<string, boolean>;
  pinnedColumns: { left: string[]; right: string[] };
}

export default function useTableState(
  tableId: string | undefined,
  defaultState: TableState,
): [TableState, (state: Partial<TableState>) => void] {
  const { currentUser, isLoading } = use(SessionContext);
  const [isInitialized, setIsInitialized] = useState(false);
  const [state, setState] = useState<TableState>(() => defaultState);
  const defaultStateRef = useRef(defaultState);

  useEffect(() => {
    defaultStateRef.current = defaultState;
  }, [defaultState]);

  const getStorageKey = useCallback(
    (userEmail?: string | null) => {
      if (!tableId) return null;
      const userIdentifier = userEmail || "anonymous";
      return `table-state-${userIdentifier}-${tableId}`;
    },
    [tableId],
  );

  const saveToStorage = useCallback(
    (storageKey: string, stateToSave: TableState) => {
      try {
        if (
          JSON.stringify(stateToSave) !==
          JSON.stringify(defaultStateRef.current)
        ) {
          localStorage.setItem(storageKey, JSON.stringify(stateToSave));
        } else {
          localStorage.removeItem(storageKey);
        }
      } catch (error) {
        logger.error("Failed to save table state to localStorage", error);
      }
    },
    [],
  );

  useEffect(() => {
    if (isLoading || isInitialized) {
      return;
    }

    const storageKey = getStorageKey(currentUser?.email);

    if (storageKey) {
      try {
        const savedState = localStorage.getItem(storageKey);
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          // Use a microtask to avoid cascading renders
          queueMicrotask(() => {
            setState(parsedState);
            setIsInitialized(true);
          });
          return;
        }
      } catch (error) {
        logger.error("Failed to load table state from localStorage", error);
      }
    }

    queueMicrotask(() => {
      setIsInitialized(true);
    });
  }, [currentUser?.email, getStorageKey, isInitialized, isLoading]);

  useEffect(() => {
    if (!isInitialized || isLoading) {
      return;
    }

    const storageKey = getStorageKey(currentUser?.email);
    if (storageKey) {
      saveToStorage(storageKey, state);
    }
  }, [
    currentUser?.email,
    getStorageKey,
    isInitialized,
    isLoading,
    saveToStorage,
    state,
  ]);

  const updateState = useCallback((newState: Partial<TableState>) => {
    setState((prevState) => ({ ...prevState, ...newState }));
  }, []);

  return [state, updateState];
}
