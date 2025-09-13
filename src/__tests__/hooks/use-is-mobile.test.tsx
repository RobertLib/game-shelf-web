import { act, renderHook } from "../test-utils";
import useIsMobile from "../../hooks/use-is-mobile";

Object.defineProperty(window, "innerWidth", {
  writable: true,
  configurable: true,
  value: 1024,
});

const addEventListenerSpy = vi.spyOn(window, "addEventListener");
const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

describe("useIsMobile Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.innerWidth = 1024;
  });

  afterEach(() => {
    addEventListenerSpy.mockClear();
    removeEventListenerSpy.mockClear();
  });

  it("returns correct value based on window width", () => {
    window.innerWidth = 375;
    const mobileResult = renderHook(() => useIsMobile());
    expect(mobileResult.result.current).toBe(true);
    mobileResult.unmount();

    window.innerWidth = 1024;
    const desktopResult = renderHook(() => useIsMobile());
    expect(desktopResult.result.current).toBe(false);
    desktopResult.unmount();

    window.innerWidth = 767;
    const boundaryMobile = renderHook(() => useIsMobile());
    expect(boundaryMobile.result.current).toBe(true);
    boundaryMobile.unmount();

    window.innerWidth = 768;
    const boundaryDesktop = renderHook(() => useIsMobile());
    expect(boundaryDesktop.result.current).toBe(false);
    boundaryDesktop.unmount();
  });

  it("adds resize event listener on mount", () => {
    renderHook(() => useIsMobile());

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );
    expect(addEventListenerSpy).toHaveBeenCalledTimes(1);
  });

  it("removes resize event listener on unmount", () => {
    const { unmount } = renderHook(() => useIsMobile());
    const addedListener = addEventListenerSpy.mock.calls[0][1];

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "resize",
      addedListener,
    );
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
  });

  it("updates state when window is resized from desktop to mobile", () => {
    window.innerWidth = 1024;
    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);

    act(() => {
      window.innerWidth = 375;
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current).toBe(true);
  });

  it("updates state when window is resized from mobile to desktop", () => {
    window.innerWidth = 375;
    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);

    act(() => {
      window.innerWidth = 1024;
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current).toBe(false);
  });

  it("handles multiple resize events correctly", () => {
    window.innerWidth = 1024;
    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);

    act(() => {
      window.innerWidth = 600;
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current).toBe(true);

    act(() => {
      window.innerWidth = 800;
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current).toBe(false);

    act(() => {
      window.innerWidth = 400;
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current).toBe(true);
  });

  it("initializes correctly based on current window width", () => {
    window.innerWidth = 320;
    const { result: mobileResult, unmount: unmountMobile } = renderHook(() =>
      useIsMobile(),
    );
    expect(mobileResult.current).toBe(true);
    unmountMobile();

    window.innerWidth = 1200;
    const { result: desktopResult, unmount: unmountDesktop } = renderHook(() =>
      useIsMobile(),
    );
    expect(desktopResult.current).toBe(false);
    unmountDesktop();
  });

  it("handles edge case widths around breakpoint", () => {
    const testWidths = [766, 767, 768, 769];
    const expectedResults = [true, true, false, false];

    testWidths.forEach((width, index) => {
      window.innerWidth = width;
      const { result, unmount } = renderHook(() => useIsMobile());
      expect(result.current).toBe(expectedResults[index]);
      unmount();
    });
  });
});
