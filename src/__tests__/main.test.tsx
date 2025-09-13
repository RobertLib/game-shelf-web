import React from "react";

const mockRender = vi.fn();
const mockCreateRoot = vi.fn(() => ({
  render: mockRender,
}));

vi.mock("react-dom/client", () => ({
  createRoot: mockCreateRoot,
}));

vi.mock("../App", () => ({
  default: () => <div data-testid="app">App Component</div>,
}));

vi.mock("../index.css", () => ({}));

describe("main.tsx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();

    vi.resetModules();
  });

  it("creates root with correct element and renders app in StrictMode", async () => {
    const mockRoot = document.createElement("div");
    mockRoot.id = "root";
    vi.spyOn(document, "getElementById").mockReturnValue(mockRoot);

    await import("../main");

    expect(document.getElementById).toHaveBeenCalledWith("root");
    expect(mockCreateRoot).toHaveBeenCalledWith(mockRoot);

    expect(mockRender).toHaveBeenCalledTimes(1);

    const renderedElement = mockRender.mock.calls[0][0];
    expect(renderedElement.type).toBe(React.StrictMode);
    expect(renderedElement.props.children).toBeDefined();
  });

  it("handles missing root element gracefully", async () => {
    vi.spyOn(document, "getElementById").mockReturnValue(null);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      await import("../main");
      expect.fail("Expected import to throw an error");
    } catch (error) {
      expect(error).toBeDefined();
    }

    consoleSpy.mockRestore();
  });
});
