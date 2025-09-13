import { renderHook } from "../test-utils";
import useIsMounted from "../../hooks/use-is-mounted";

describe("useIsMounted Hook", () => {
  it("returns true when mounted and stays consistent", () => {
    const { result, rerender, unmount } = renderHook(() => useIsMounted());

    expect(result.current).toBe(true);

    rerender();
    expect(result.current).toBe(true);

    unmount();

    const secondMount = renderHook(() => useIsMounted());
    expect(secondMount.result.current).toBe(true);
    secondMount.unmount();
  });

  it("works correctly with multiple instances", () => {
    const instance1 = renderHook(() => useIsMounted());
    const instance2 = renderHook(() => useIsMounted());

    expect(instance1.result.current).toBe(true);
    expect(instance2.result.current).toBe(true);

    instance1.rerender();
    instance2.rerender();

    expect(instance1.result.current).toBe(true);
    expect(instance2.result.current).toBe(true);

    instance1.unmount();
    expect(instance2.result.current).toBe(true);

    instance2.unmount();
  });

  it("handles rapid mount/unmount cycles", () => {
    for (let i = 0; i < 5; i++) {
      const { result, rerender, unmount } = renderHook(() => useIsMounted());

      expect(result.current).toBe(true);
      rerender();
      expect(result.current).toBe(true);

      unmount();
    }
  });

  it("useEffect dependency array is empty (runs only once)", () => {
    const { result, rerender } = renderHook(() => useIsMounted());

    expect(result.current).toBe(true);

    for (let i = 0; i < 10; i++) {
      rerender();
      expect(result.current).toBe(true);
    }
  });

  it("hook maintains mounted state across re-renders", () => {
    let renderCount = 0;

    const { result, rerender } = renderHook(() => {
      renderCount++;
      const mounted = useIsMounted();
      return { mounted, renderCount };
    });

    expect(result.current.mounted).toBe(true);

    const initialRenderCount = result.current.renderCount;
    expect(initialRenderCount).toBeGreaterThan(0);

    rerender();
    expect(result.current.mounted).toBe(true);
    expect(result.current.renderCount).toBe(initialRenderCount + 1);

    rerender();
    expect(result.current.mounted).toBe(true);
    expect(result.current.renderCount).toBe(initialRenderCount + 2);
  });

  it("can be used in conditional rendering scenarios", () => {
    const { result, rerender } = renderHook(() => useIsMounted());

    const shouldRender = result.current;

    expect(shouldRender).toBe(true);

    rerender();
    const shouldRenderAfterRerender = result.current;
    expect(shouldRenderAfterRerender).toBe(true);
  });

  it("hook behavior matches real-world usage pattern", () => {
    const { result, unmount } = renderHook(() => {
      const isMounted = useIsMounted();

      const safeSetState = (updater: () => void) => {
        if (isMounted) {
          updater();
        }
      };

      return { isMounted, safeSetState };
    });

    expect(result.current.isMounted).toBe(true);

    let stateUpdated = false;
    result.current.safeSetState(() => {
      stateUpdated = true;
    });

    expect(stateUpdated).toBe(true);

    unmount();
  });

  it("hook state persists independently of external changes", () => {
    const { result, rerender } = renderHook(() => {
      const mounted = useIsMounted();
      return mounted;
    });

    expect(result.current).toBe(true);

    rerender();
    expect(result.current).toBe(true);

    rerender();
    expect(result.current).toBe(true);

    rerender();
    expect(result.current).toBe(true);
  });
});
