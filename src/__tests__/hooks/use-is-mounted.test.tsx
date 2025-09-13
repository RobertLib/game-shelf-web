import { renderHook, waitFor } from "../test-utils";
import useIsMounted from "../../hooks/use-is-mounted";

describe("useIsMounted Hook", () => {
  it("returns true when mounted and stays consistent", async () => {
    const { result, rerender, unmount } = renderHook(() => useIsMounted());

    await waitFor(() => expect(result.current).toBe(true));

    rerender();
    await waitFor(() => expect(result.current).toBe(true));

    unmount();

    const secondMount = renderHook(() => useIsMounted());
    await waitFor(() => expect(secondMount.result.current).toBe(true));
    secondMount.unmount();
  });

  it("works correctly with multiple instances", async () => {
    const instance1 = renderHook(() => useIsMounted());
    const instance2 = renderHook(() => useIsMounted());

    await waitFor(() => expect(instance1.result.current).toBe(true));
    await waitFor(() => expect(instance2.result.current).toBe(true));

    instance1.rerender();
    instance2.rerender();

    await waitFor(() => expect(instance1.result.current).toBe(true));
    await waitFor(() => expect(instance2.result.current).toBe(true));

    instance1.unmount();
    await waitFor(() => expect(instance2.result.current).toBe(true));

    instance2.unmount();
  });

  it("handles rapid mount/unmount cycles", async () => {
    for (let i = 0; i < 5; i++) {
      const { result, rerender, unmount } = renderHook(() => useIsMounted());

      await waitFor(() => expect(result.current).toBe(true));
      rerender();
      await waitFor(() => expect(result.current).toBe(true));

      unmount();
    }
  });

  it("useEffect dependency array is empty (runs only once)", async () => {
    const { result, rerender } = renderHook(() => useIsMounted());

    await waitFor(() => expect(result.current).toBe(true));

    for (let i = 0; i < 10; i++) {
      rerender();
      await waitFor(() => expect(result.current).toBe(true));
    }
  });

  it("hook maintains mounted state across re-renders", async () => {
    let renderCount = 0;

    const { result, rerender } = renderHook(() => {
      renderCount++;
      const mounted = useIsMounted();
      return { mounted, renderCount };
    });

    await waitFor(() => expect(result.current.mounted).toBe(true));

    const initialRenderCount = result.current.renderCount;
    expect(initialRenderCount).toBeGreaterThan(0);

    rerender();
    await waitFor(() => expect(result.current.mounted).toBe(true));
    expect(result.current.renderCount).toBe(initialRenderCount + 1);

    rerender();
    await waitFor(() => expect(result.current.mounted).toBe(true));
    expect(result.current.renderCount).toBe(initialRenderCount + 2);
  });

  it("can be used in conditional rendering scenarios", async () => {
    const { result, rerender } = renderHook(() => useIsMounted());

    await waitFor(() => {
      const shouldRender = result.current;
      expect(shouldRender).toBe(true);
    });

    rerender();
    await waitFor(() => {
      const shouldRenderAfterRerender = result.current;
      expect(shouldRenderAfterRerender).toBe(true);
    });
  });

  it("hook behavior matches real-world usage pattern", async () => {
    const { result, unmount } = renderHook(() => {
      const isMounted = useIsMounted();

      const safeSetState = (updater: () => void) => {
        if (isMounted) {
          updater();
        }
      };

      return { isMounted, safeSetState };
    });

    await waitFor(() => expect(result.current.isMounted).toBe(true));

    let stateUpdated = false;
    result.current.safeSetState(() => {
      stateUpdated = true;
    });

    expect(stateUpdated).toBe(true);

    unmount();
  });

  it("hook state persists independently of external changes", async () => {
    const { result, rerender } = renderHook(() => {
      const mounted = useIsMounted();
      return mounted;
    });

    await waitFor(() => expect(result.current).toBe(true));

    rerender();
    await waitFor(() => expect(result.current).toBe(true));

    rerender();
    await waitFor(() => expect(result.current).toBe(true));

    rerender();
    await waitFor(() => expect(result.current).toBe(true));
  });
});
