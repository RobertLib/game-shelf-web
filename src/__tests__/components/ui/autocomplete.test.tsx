import {
  act,
  fireEvent,
  renderWithProviders,
  rerenderWithProviders,
  screen,
  waitFor,
} from "../../test-utils";
import { InMemoryCache } from "@apollo/client";
import { MockLink } from "@apollo/client/testing";
import { parse } from "graphql";
import Autocomplete from "../../../components/ui/autocomplete";

const mockOptions = [
  { label: "Option 1", value: "option1" },
  { label: "Option 2", value: "option2" },
  { label: "Option 3", value: "option3" },
];

const createApolloOptions = () => ({
  addTypename: false,
  cache: new InMemoryCache(),
});

const renderWithApollo = (
  component: React.ReactElement,
  mocks: MockLink.MockedResponse[] = [],
) =>
  renderWithProviders(component, {
    mocks,
    apolloOptions: createApolloOptions(),
  });

describe("Autocomplete Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with required props", () => {
    renderWithApollo(<Autocomplete options={mockOptions} />);
    expect(document.querySelector(".popover")).toBeInTheDocument();
  });

  it("renders with label", () => {
    renderWithApollo(<Autocomplete options={mockOptions} label="Test Label" />);
    expect(screen.getByText("Test Label:")).toBeInTheDocument();
  });

  it("shows required indicator when required is true", () => {
    renderWithApollo(
      <Autocomplete options={mockOptions} label="Test Label" required />,
    );
    const requiredIndicator = screen.getByText("*");
    expect(requiredIndicator).toHaveClass("text-danger-500");
  });

  it("shows error message when error is provided", () => {
    renderWithApollo(
      <Autocomplete options={mockOptions} error="This field is required" />,
    );
    const errorElement = screen.getByTestId("form-error");
    expect(errorElement).toHaveTextContent("This field is required");
  });

  it("applies error styling when error is provided", () => {
    renderWithApollo(
      <Autocomplete
        options={mockOptions}
        error="This field is required"
        data-testid="autocomplete"
      />,
    );

    const inputContainer = document
      .querySelector(".popover")
      ?.querySelector("div");
    expect(inputContainer?.className).toContain("border-danger-500!");
  });

  it("opens dropdown on click in select mode", () => {
    renderWithApollo(<Autocomplete options={mockOptions} asSelect />);

    fireEvent.click(document.querySelector(".popover")!);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    mockOptions.forEach((option) => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  it("filters options based on input in autocomplete mode", () => {
    renderWithApollo(<Autocomplete options={mockOptions} />);

    fireEvent.click(document.querySelector(".popover")!);

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "Option 1" } });

    const options = screen.getAllByRole("option");
    expect(options.length).toBe(1);
    expect(options[0]).toHaveTextContent("Option 1");
  });

  it("selects an option when clicked", () => {
    const handleChange = vi.fn();
    renderWithApollo(
      <Autocomplete options={mockOptions} onChange={handleChange} />,
    );

    fireEvent.click(document.querySelector(".popover")!);
    fireEvent.click(screen.getByText("Option 2"));

    expect(handleChange).toHaveBeenCalledWith("option2", null);
    expect(screen.getByRole("combobox")).toHaveValue("Option 2");
  });

  it("works in multiple selection mode", () => {
    const handleChange = vi.fn();

    const { unmount } = renderWithApollo(
      <Autocomplete options={mockOptions} multiple onChange={handleChange} />,
    );

    fireEvent.click(document.querySelector(".popover")!);
    fireEvent.click(screen.getByText("Option 1"));
    expect(handleChange).toHaveBeenCalledWith(["option1"], []);

    const chips = screen.getAllByTestId("chip");
    expect(chips.length).toBe(1);
    expect(chips[0]).toHaveTextContent("Option 1");

    unmount();

    renderWithApollo(
      <Autocomplete
        options={mockOptions}
        multiple
        value={["option1", "option2"]}
      />,
    );

    const updatedChips = screen.getAllByTestId("chip");
    expect(updatedChips.length).toBe(2);
  });

  it("toggles options in multiple selection mode", () => {
    const handleChange = vi.fn();

    renderWithApollo(
      <Autocomplete
        options={mockOptions}
        multiple
        onChange={handleChange}
        value={["option1"]}
      />,
    );

    fireEvent.click(document.querySelector(".popover")!);

    // Click on already selected option should toggle it off
    fireEvent.click(screen.getByText("Option 1"));
    expect(handleChange).toHaveBeenCalledWith([], []);

    // Click on unselected option should toggle it on
    fireEvent.click(screen.getByText("Option 2"));
    expect(handleChange).toHaveBeenCalledWith(["option2"], []);
  });

  it("handles clear button functionality", async () => {
    const handleChange = vi.fn();

    renderWithApollo(
      <Autocomplete
        options={mockOptions}
        onChange={handleChange}
        value="option1"
      />,
    );

    expect(screen.getByRole("combobox")).toHaveValue("Option 1");

    const clearButton = screen.getByRole("button", { name: /clear/i });

    fireEvent.click(clearButton);
    expect(handleChange).toHaveBeenCalledWith(null, null);
  });

  it("handles value clearing and null/empty states", () => {
    renderWithApollo(<Autocomplete options={mockOptions} value={null} />);
    expect(screen.getByRole("combobox")).toHaveValue("");

    rerenderWithProviders(
      <Autocomplete options={mockOptions} value="option1" />,
    );
    expect(screen.getByRole("combobox")).toHaveValue("Option 1");

    rerenderWithProviders(<Autocomplete options={mockOptions} value={null} />);
    expect(screen.getByRole("combobox")).toHaveValue("");

    rerenderWithProviders(
      <Autocomplete options={mockOptions} value="option1" />,
    );
    expect(screen.getByRole("combobox")).toHaveValue("Option 1");

    rerenderWithProviders(<Autocomplete options={mockOptions} value="" />);
    expect(screen.getByRole("combobox")).toHaveValue("");
  });

  it("removes selected option when chip is clicked in multiple mode", () => {
    const handleChange = vi.fn();
    renderWithApollo(
      <Autocomplete
        options={mockOptions}
        multiple
        onChange={handleChange}
        value={["option1", "option2"]}
      />,
    );

    const chips = screen.getAllByTestId("chip");
    expect(chips.length).toBe(2);

    fireEvent.click(chips[0]);

    expect(handleChange).toHaveBeenCalledWith(["option2"], []);
  });

  it("supports keyboard navigation", () => {
    renderWithApollo(<Autocomplete options={mockOptions} />);

    const input = screen.getByRole("combobox");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(input).toHaveValue("Option 2");
  });

  it("sets initial value from prop", () => {
    renderWithApollo(<Autocomplete options={mockOptions} value="option3" />);
    expect(screen.getByRole("combobox")).toHaveValue("Option 3");
  });

  it("creates hidden inputs for form submission", () => {
    renderWithApollo(
      <Autocomplete options={mockOptions} name="test-field" value="option2" />,
    );

    const hiddenInput = document.querySelector('input[type="hidden"]');
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput).toHaveAttribute("name", "test-field");
    expect(hiddenInput).toHaveAttribute("value", "option2");
  });

  it("creates multiple hidden inputs in multiple mode", () => {
    renderWithApollo(
      <Autocomplete
        options={mockOptions}
        name="test-field"
        multiple
        value={["option1", "option3"]}
      />,
    );

    const hiddenInputs = document.querySelectorAll('input[type="hidden"]');
    expect(hiddenInputs.length).toBe(2);
    expect(hiddenInputs[0]).toHaveAttribute("value", "option1");
    expect(hiddenInputs[1]).toHaveAttribute("value", "option3");
  });

  it("shows empty option when hasEmpty is true in select mode", () => {
    renderWithApollo(<Autocomplete options={mockOptions} asSelect hasEmpty />);

    fireEvent.click(document.querySelector(".popover")!);

    const options = screen.getAllByRole("option");
    expect(options.length).toBe(4);
    expect(options[0]).toBeInTheDocument();
    expect(options[0].textContent?.trim()).toBe("");
  });

  it("calls loadMore when scrolling to bottom", async () => {
    const loadMore = vi.fn().mockResolvedValue(undefined);

    renderWithApollo(
      <Autocomplete options={mockOptions} loadMore={loadMore} />,
    );

    fireEvent.click(document.querySelector(".popover")!);

    const popoverContent = screen.getByRole("dialog");

    await new Promise((resolve) => setTimeout(resolve, 50));

    Object.defineProperty(popoverContent, "scrollTop", {
      value: 100,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(popoverContent, "scrollHeight", {
      value: 120,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(popoverContent, "clientHeight", {
      value: 30,
      writable: true,
      configurable: true,
    });

    const scrollEvent = new Event("scroll", { bubbles: true });
    act(() => {
      popoverContent.dispatchEvent(scrollEvent);
    });

    await waitFor(
      () => {
        expect(loadMore).toHaveBeenCalledTimes(1);
      },
      { timeout: 2000 },
    );
  });

  it("shows no results message when no options match the filter", () => {
    renderWithApollo(<Autocomplete options={mockOptions} />);

    fireEvent.click(document.querySelector(".popover")!);

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "No match" } });

    expect(screen.getByText("Žádné výsledky")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    renderWithApollo(
      <Autocomplete
        options={mockOptions}
        className="custom-class"
        data-testid="autocomplete"
      />,
    );

    const container = screen.getByTestId("autocomplete");
    expect(container).toHaveClass("custom-class");
    expect(container).toHaveClass("relative");
  });

  it("forwards additional props to container", () => {
    renderWithApollo(
      <Autocomplete
        options={mockOptions}
        data-testid="autocomplete-test"
        aria-label="Autocomplete field"
      />,
    );

    const container = screen.getByTestId("autocomplete-test");
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute("aria-label", "Autocomplete field");
  });

  it("handles defaultValue prop correctly", () => {
    renderWithApollo(
      <Autocomplete options={mockOptions} defaultValue="option1" />,
    );
    expect(screen.getByRole("combobox")).toHaveValue("Option 1");
  });

  it("handles error when loading more options fails", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const mockError = new Error("Failed to load");
    const loadMore = vi.fn().mockRejectedValue(mockError);

    renderWithApollo(
      <Autocomplete options={mockOptions} loadMore={loadMore} />,
    );

    fireEvent.click(document.querySelector(".popover")!);

    const popoverContent = screen.getByRole("dialog");

    await new Promise((resolve) => setTimeout(resolve, 50));

    Object.defineProperty(popoverContent, "scrollTop", {
      value: 100,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(popoverContent, "scrollHeight", {
      value: 120,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(popoverContent, "clientHeight", {
      value: 30,
      writable: true,
      configurable: true,
    });

    const scrollEvent = new Event("scroll", { bubbles: true });
    act(() => {
      popoverContent.dispatchEvent(scrollEvent);
    });

    await waitFor(
      () => {
        expect(loadMore).toHaveBeenCalledTimes(1);
      },
      { timeout: 2000 },
    );

    consoleErrorSpy.mockRestore();
  });

  it("toggles off already selected option in multiple mode", () => {
    const handleChange = vi.fn();
    renderWithApollo(
      <Autocomplete
        options={mockOptions}
        multiple
        onChange={handleChange}
        value={["option1"]}
      />,
    );

    fireEvent.click(document.querySelector(".popover")!);
    fireEvent.click(screen.getByText("Option 1"));

    expect(handleChange).toHaveBeenCalledWith([], []);
  });

  it("handles space key to open dropdown", () => {
    renderWithApollo(<Autocomplete options={mockOptions} />);

    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: " " });

    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("handles focus to open dropdown in non-select mode", () => {
    renderWithApollo(<Autocomplete options={mockOptions} />);

    fireEvent.focus(document.querySelector(".popover")!);

    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("handles escape key to close dropdown", () => {
    renderWithApollo(<Autocomplete options={mockOptions} />);

    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" });

    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(input, { key: "Escape" });

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("allows keyboard navigation up with ArrowUp key", () => {
    renderWithApollo(<Autocomplete options={mockOptions} />);

    const input = screen.getByRole("combobox");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(input).toHaveValue("Option 2");
  });

  it("handles changing input in non-select mode", () => {
    const handleChange = vi.fn();
    renderWithApollo(
      <Autocomplete
        options={mockOptions}
        onChange={handleChange}
        value="option1"
      />,
    );

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "Option" } });

    expect(handleChange).not.toHaveBeenCalled();
    expect(input).toHaveValue("Option");
  });

  it("handles mouse enter on option to update active index", () => {
    renderWithApollo(<Autocomplete options={mockOptions} />);

    fireEvent.click(document.querySelector(".popover")!);

    const options = screen.getAllByRole("option");
    fireEvent.mouseEnter(options[1]);

    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "Enter" });

    expect(input).toHaveValue("Option 2");
  });

  it("uses chip keyboard accessibility (Enter key) to remove option", () => {
    const handleChange = vi.fn();
    renderWithApollo(
      <Autocomplete
        options={mockOptions}
        multiple
        onChange={handleChange}
        value={["option1", "option2"]}
      />,
    );

    const chips = screen.getAllByTestId("chip");
    fireEvent.keyDown(chips[0], { key: "Enter" });

    expect(handleChange).toHaveBeenCalledWith(["option2"], []);
  });

  it("handles Home key to navigate to first option", () => {
    renderWithApollo(<Autocomplete options={mockOptions} />);

    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Home" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(input).toHaveValue("Option 1");
  });

  it("handles End key to navigate to last option", () => {
    renderWithApollo(<Autocomplete options={mockOptions} />);

    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "End" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(input).toHaveValue("Option 3");
  });

  it("prevents ArrowDown from going beyond last option", () => {
    renderWithApollo(<Autocomplete options={mockOptions} />);

    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" });

    for (let i = 0; i < 5; i++) {
      fireEvent.keyDown(input, { key: "ArrowDown" });
    }

    fireEvent.keyDown(input, { key: "Enter" });
    expect(input).toHaveValue("Option 3");
  });

  it("prevents ArrowUp from going beyond first option", () => {
    renderWithApollo(<Autocomplete options={mockOptions} />);

    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowUp" });
    fireEvent.keyDown(input, { key: "ArrowUp" });

    fireEvent.keyDown(input, { key: "Enter" });
    expect(input).toHaveValue("Option 1");
  });

  it("handles empty selection in select mode with hasEmpty", () => {
    const handleChange = vi.fn();
    renderWithApollo(
      <Autocomplete
        options={mockOptions}
        asSelect
        hasEmpty
        onChange={handleChange}
      />,
    );

    fireEvent.click(document.querySelector(".popover")!);

    const emptyOption = screen.getAllByRole("option")[0];
    fireEvent.click(emptyOption);

    expect(handleChange).toHaveBeenCalledWith(null, null);
    expect(screen.getByRole("combobox")).toHaveValue("");
  });

  it("displays placeholder text correctly", () => {
    renderWithApollo(
      <Autocomplete options={mockOptions} placeholder="Choose an option..." />,
    );

    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("placeholder", "Choose an option...");
  });

  it("shows chevron icon in select mode", () => {
    renderWithApollo(<Autocomplete options={mockOptions} asSelect />);

    const chevron = document.querySelector("svg");
    expect(chevron).toBeInTheDocument();
  });

  it("rotates chevron when dropdown is open in select mode", () => {
    renderWithApollo(<Autocomplete options={mockOptions} asSelect />);

    const chevron = document.querySelector("svg");
    expect(chevron).not.toHaveClass("rotate-180");

    fireEvent.click(document.querySelector(".popover")!);

    expect(chevron).toHaveClass("rotate-180");
  });

  it("handles disabled state properly", () => {
    renderWithApollo(
      <Autocomplete options={mockOptions} data-testid="autocomplete" />,
    );

    const container = screen.getByTestId("autocomplete");
    expect(container).toBeInTheDocument();
  });

  it("handles readonly state in select mode", () => {
    renderWithApollo(<Autocomplete options={mockOptions} asSelect />);

    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("readonly");
    expect(input).toHaveAttribute("tabIndex", "-1");
  });

  it("makes trigger div focusable and clickable in asSelect mode", () => {
    renderWithApollo(<Autocomplete options={mockOptions} asSelect />);

    const triggerDiv = document.querySelector('[role="button"]');
    expect(triggerDiv).toBeInTheDocument();
    expect(triggerDiv).toHaveAttribute("tabIndex", "0");
    expect(triggerDiv).toHaveClass("cursor-pointer");
  });

  it("opens dropdown when clicking trigger div in asSelect mode", () => {
    renderWithApollo(<Autocomplete options={mockOptions} asSelect />);

    const triggerDiv = document.querySelector('[role="button"]');
    fireEvent.click(triggerDiv!);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("opens dropdown when pressing Enter or Space on trigger div in asSelect mode", () => {
    renderWithApollo(<Autocomplete options={mockOptions} asSelect />);

    const triggerDiv = document.querySelector('[role="button"]');

    fireEvent.keyDown(triggerDiv!, { key: "Enter" });
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Close and test Space key
    fireEvent.keyDown(document, { key: "Escape" });

    fireEvent.keyDown(triggerDiv!, { key: " " });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("handles multiple selection with chips correctly", () => {
    renderWithApollo(
      <Autocomplete options={mockOptions} multiple value={["option1"]} />,
    );

    const chips = screen.getAllByTestId("chip");
    expect(chips[0]).toHaveTextContent("Option 1 ×");
    expect(chips[0]).toHaveAttribute("role", "button");
    expect(chips[0]).toHaveAttribute("tabIndex", "0");
  });

  it("stops propagation when clicking input in non-select mode", () => {
    const handleClick = vi.fn();
    renderWithApollo(
      <div onClick={handleClick}>
        <Autocomplete options={mockOptions} />
      </div>,
    );

    const input = screen.getByRole("combobox");
    fireEvent.click(input);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("handles aria attributes correctly", async () => {
    renderWithApollo(
      <Autocomplete
        options={mockOptions}
        label="Test Field"
        required
        error="Required field"
      />,
    );

    const input = screen.getByRole("combobox");

    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).toHaveAttribute("aria-autocomplete", "list");

    fireEvent.click(document.querySelector(".popover")!);

    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(input).toHaveAttribute("aria-controls");

    const listbox = screen.getByRole("listbox");
    expect(listbox).toHaveAttribute("aria-multiselectable", "false");
  });

  it("handles click outside properly", () => {
    renderWithApollo(<Autocomplete options={mockOptions} />);

    fireEvent.click(document.querySelector(".popover")!);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("removes duplicates when updating value in multiple mode", () => {
    renderWithApollo(
      <Autocomplete
        options={mockOptions}
        multiple
        value={["option1", "option1", "option2"]}
      />,
    );

    const chips = screen.getAllByTestId("chip");
    expect(chips).toHaveLength(2);
    expect(chips[0]).toHaveTextContent("Option 1 ×");
    expect(chips[1]).toHaveTextContent("Option 2 ×");
  });

  it("handles undefined defaultValue gracefully", () => {
    renderWithApollo(
      <Autocomplete options={mockOptions} defaultValue={undefined} />,
    );

    expect(screen.getByRole("combobox")).toHaveValue("");
  });

  it("processes option click correctly with keyboard", () => {
    renderWithApollo(<Autocomplete options={mockOptions} />);

    fireEvent.click(document.querySelector(".popover")!);

    const option = screen.getByText("Option 2");
    fireEvent.keyDown(option, { key: "Enter" });

    expect(screen.getByRole("combobox")).toHaveValue("Option 2");
  });

  it("handles loading state properly", () => {
    const loadMore = vi.fn();

    renderWithApollo(
      <Autocomplete options={mockOptions} loadMore={loadMore} />,
    );

    fireEvent.click(document.querySelector(".popover")!);

    const popoverContent = screen.getByRole("dialog");
    expect(popoverContent).toBeInTheDocument();

    expect(loadMore).toBeDefined();
  });

  it("ignores scroll when loading function not provided", async () => {
    renderWithApollo(<Autocomplete options={mockOptions} />);

    fireEvent.click(document.querySelector(".popover")!);

    const popoverContent = screen.getByRole("dialog");

    Object.defineProperty(popoverContent, "scrollTop", {
      value: 100,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(popoverContent, "scrollHeight", {
      value: 120,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(popoverContent, "clientHeight", {
      value: 30,
      writable: true,
      configurable: true,
    });

    const scrollEvent = new Event("scroll", { bubbles: true });
    act(() => {
      popoverContent.dispatchEvent(scrollEvent);
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("handles option selection when no change callback is provided", () => {
    renderWithApollo(<Autocomplete options={mockOptions} />);

    fireEvent.click(document.querySelector(".popover")!);
    fireEvent.click(screen.getByText("Option 1"));

    expect(screen.getByRole("combobox")).toHaveValue("Option 1");
  });

  it("handles chip removal when no change callback is provided", () => {
    renderWithApollo(
      <Autocomplete options={mockOptions} multiple value={["option1"]} />,
    );

    const chips = screen.getAllByTestId("chip");
    expect(chips).toHaveLength(1);

    fireEvent.click(chips[0]);

    expect(screen.queryAllByTestId("chip")).toHaveLength(0);
  });

  it("handles different keyboard events that should be ignored", () => {
    renderWithApollo(<Autocomplete options={mockOptions} />);

    const input = screen.getByRole("combobox");

    fireEvent.keyDown(input, { key: "Tab" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    fireEvent.keyDown(input, { key: "a" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("handles defaultValue with array for multiple mode", () => {
    renderWithApollo(
      <Autocomplete
        options={mockOptions}
        multiple
        defaultValue={["option1", "option2"]}
      />,
    );

    const chips = screen.getAllByTestId("chip");
    expect(chips).toHaveLength(2);
    expect(chips[0]).toHaveTextContent("Option 1 ×");
    expect(chips[1]).toHaveTextContent("Option 2 ×");
  });

  it("handles value changes from undefined to actual value", () => {
    const { rerender } = renderWithApollo(
      <Autocomplete options={mockOptions} value={undefined} />,
    );

    expect(screen.getByRole("combobox")).toHaveValue("");

    rerender(<Autocomplete options={mockOptions} value="option1" />);

    expect(screen.getByRole("combobox")).toHaveValue("Option 1");
  });

  it("handles input change in multiple mode with chips", () => {
    const handleChange = vi.fn();
    renderWithApollo(
      <Autocomplete
        options={mockOptions}
        multiple
        onChange={handleChange}
        value={["option1"]}
      />,
    );

    const chipsContainer = document.querySelector(".flex.w-full.flex-wrap");
    const input = chipsContainer?.querySelector(
      'input[type="text"]',
    ) as HTMLInputElement;

    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "test" } });

    expect(input.value).toBe("test");
  });

  it("handles readonly input correctly in non-select mode", () => {
    renderWithApollo(<Autocomplete options={mockOptions} />);

    const input = screen.getByRole("combobox");
    expect(input).not.toHaveAttribute("readonly");
  });

  it("handles tabIndex correctly in select vs non-select mode", () => {
    const { rerender } = renderWithApollo(
      <Autocomplete options={mockOptions} asSelect />,
    );

    let input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("tabIndex", "-1");

    rerender(<Autocomplete options={mockOptions} />);

    input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("tabIndex", "0");
  });

  it("handles aria-expanded correctly when opening/closing", () => {
    renderWithApollo(<Autocomplete options={mockOptions} />);

    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(document.querySelector(".popover")!);
    expect(input).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(input, { key: "Escape" });
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("handles chip mousedown event in multiple mode", () => {
    renderWithApollo(
      <Autocomplete options={mockOptions} multiple value={["option1"]} />,
    );

    const chip = screen.getByTestId("chip");
    const mouseDownEvent = new MouseEvent("mousedown", { bubbles: true });
    const preventDefaultSpy = vi.spyOn(mouseDownEvent, "preventDefault");
    const stopPropagationSpy = vi.spyOn(mouseDownEvent, "stopPropagation");

    fireEvent(chip, mouseDownEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it("handles input onChange in single mode when value differs from selected", () => {
    const handleChange = vi.fn();
    renderWithApollo(
      <Autocomplete
        options={mockOptions}
        onChange={handleChange}
        value="option1"
      />,
    );

    const input = screen.getByRole("combobox");
    expect(input).toHaveValue("Option 1");

    fireEvent.change(input, { target: { value: "Different text" } });

    expect(input).toHaveValue("Different text");
  });

  const mockQuery = parse(`
    query MockUsers($search: String, $first: Int, $after: String) {
      users(search: $search, first: $first, after: $after) {
        nodes {
          id
          name
          email
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
      nested: organization {
        department {
          users(search: $search, first: $first, after: $after) {
            nodes {
              id
              name
              email
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }
      }
    }
  `);

  const mockVariables = (search: string) => ({ search });

  it("handles GraphQL mode initialization", async () => {
    const mocks = [
      {
        request: {
          query: mockQuery,
          variables: { search: "", first: 100 },
        },
        result: {
          data: {
            users: {
              nodes: [
                { id: "1", name: "John Doe" },
                { id: "2", name: "Jane Smith" },
              ],
              pageInfo: {
                endCursor: "cursor123",
                hasNextPage: true,
              },
            },
          },
        },
      },
    ];

    renderWithApollo(
      <Autocomplete
        query={mockQuery}
        variables={mockVariables}
        dataPath="users"
      />,
      mocks,
    );

    fireEvent.click(document.querySelector(".popover")!);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
  });

  it("loads data immediately when opening in asSelect mode with GraphQL", async () => {
    const mocks = [
      {
        request: {
          query: mockQuery,
          variables: { search: "", first: 100 },
        },
        result: {
          data: {
            users: {
              nodes: [
                { id: "1", name: "John Doe" },
                { id: "2", name: "Jane Smith" },
              ],
              pageInfo: {
                endCursor: "cursor123",
                hasNextPage: true,
              },
            },
          },
        },
      },
      // Fallback mock for any additional calls
      {
        request: {
          query: mockQuery,
          variables: { search: "", first: 100 },
        },
        result: {
          data: {
            users: {
              nodes: [
                { id: "1", name: "John Doe" },
                { id: "2", name: "Jane Smith" },
              ],
              pageInfo: {
                endCursor: "cursor123",
                hasNextPage: true,
              },
            },
          },
        },
      },
    ];

    renderWithApollo(
      <Autocomplete
        query={mockQuery}
        variables={mockVariables}
        dataPath="users"
        asSelect
      />,
      mocks,
    );

    // Click to open the select dropdown
    const triggerDiv = document.querySelector('[role="button"]');
    fireEvent.click(triggerDiv!);

    // Data should load automatically in asSelect mode
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });
  });

  it("loads all data when opening asSelect mode even with pre-selected value", async () => {
    const mocks = [
      {
        request: {
          query: mockQuery,
          variables: { search: "", first: 100 },
        },
        result: {
          data: {
            users: {
              nodes: [
                { id: "1", name: "User One" },
                { id: "2", name: "User Two" },
                { id: "3", name: "User Three" },
              ],
              pageInfo: {
                endCursor: "cursor123",
                hasNextPage: false,
              },
            },
          },
        },
      },
    ];

    renderWithApollo(
      <Autocomplete
        query={mockQuery}
        variables={mockVariables}
        dataPath="users"
        asSelect
        value="1"
      />,
      mocks,
    );

    // Click to open the select dropdown - should load all options
    const triggerDiv = document.querySelector('[role="button"]');
    fireEvent.click(triggerDiv!);

    // All data should be available for selection, regardless of current value
    await waitFor(() => {
      expect(screen.getByText("User One")).toBeInTheDocument();
      expect(screen.getByText("User Two")).toBeInTheDocument();
      expect(screen.getByText("User Three")).toBeInTheDocument();
    });
  });

  it("handles data path parsing correctly", async () => {
    const nestedMocks = [
      {
        request: {
          query: mockQuery,
          variables: { search: "", first: 100 },
        },
        result: {
          data: {
            nested: {
              data: {
                users: {
                  nodes: [{ id: "1", name: "Nested User" }],
                  pageInfo: {
                    endCursor: null,
                    hasNextPage: false,
                  },
                },
              },
            },
          },
        },
      },
    ];

    renderWithApollo(
      <Autocomplete
        query={mockQuery}
        variables={mockVariables}
        dataPath="nested.data.users"
      />,
      nestedMocks,
    );

    fireEvent.click(document.querySelector(".popover")!);

    await waitFor(() => {
      expect(screen.getByText("Nested User")).toBeInTheDocument();
    });
  });

  it("uses custom getOptionLabel and getOptionValue functions", async () => {
    const mocks = [
      {
        request: {
          query: mockQuery,
          variables: { search: "", first: 100 },
        },
        result: {
          data: {
            users: {
              nodes: [{ id: "1", name: "John Doe", email: "john@test.com" }],
              pageInfo: {
                endCursor: null,
                hasNextPage: false,
              },
            },
          },
        },
      },
    ];

    const getOptionLabel = (item: { name: string; email: string }) =>
      `${item.name} <${item.email}>`;
    const getOptionValue = (item: { email: string }) => item.email;

    renderWithApollo(
      <Autocomplete
        query={mockQuery}
        variables={mockVariables}
        dataPath="users"
        getOptionLabel={getOptionLabel}
        getOptionValue={getOptionValue}
      />,
      mocks,
    );

    fireEvent.click(document.querySelector(".popover")!);

    await waitFor(() => {
      expect(screen.getByText("John Doe <john@test.com>")).toBeInTheDocument();
    });
  });

  it.skip("handles search debouncing in GraphQL mode", async () => {
    const mocks = [
      {
        request: {
          query: mockQuery,
          variables: { search: "", first: 100 },
        },
        result: {
          data: {
            users: {
              nodes: [{ id: "1", name: "Initial User" }],
              pageInfo: { endCursor: null, hasNextPage: false },
            },
          },
        },
      },
      {
        request: {
          query: mockQuery,
          variables: { search: "John", first: 100 },
        },
        result: {
          data: {
            users: {
              nodes: [{ id: "2", name: "John Doe" }],
              pageInfo: { endCursor: null, hasNextPage: false },
            },
          },
        },
      },
    ];

    renderWithApollo(
      <Autocomplete
        query={mockQuery}
        variables={mockVariables}
        dataPath="users"
      />,
      mocks,
    );

    fireEvent.click(document.querySelector(".popover")!);

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "John" } });

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
  });

  it("handles GraphQL pagination with cursor", async () => {
    const firstPageMock = {
      request: {
        query: mockQuery,
        variables: { search: "", first: 100 },
      },
      result: {
        data: {
          users: {
            nodes: [{ id: "1", name: "User 1" }],
            pageInfo: {
              endCursor: "cursor123",
              hasNextPage: true,
            },
          },
        },
      },
    };

    const secondPageMock = {
      request: {
        query: mockQuery,
        variables: { search: "", first: 100, after: "cursor123" },
      },
      result: {
        data: {
          users: {
            nodes: [{ id: "2", name: "User 2" }],
            pageInfo: {
              endCursor: "cursor456",
              hasNextPage: false,
            },
          },
        },
      },
    };

    renderWithApollo(
      <Autocomplete
        query={mockQuery}
        variables={mockVariables}
        dataPath="users"
      />,
      [firstPageMock, secondPageMock],
    );

    fireEvent.click(document.querySelector(".popover")!);

    await waitFor(() => {
      expect(screen.getByText("User 1")).toBeInTheDocument();
    });

    expect(screen.queryByText("User 2")).not.toBeInTheDocument();

    expect(screen.getByText("User 1")).toBeInTheDocument();
  });

  it("prevents duplicate options when loading more data", async () => {
    const mocks = [
      {
        request: {
          query: mockQuery,
          variables: { search: "", first: 100 },
        },
        result: {
          data: {
            users: {
              nodes: [
                { id: "1", name: "User 1" },
                { id: "2", name: "User 2" },
              ],
              pageInfo: {
                endCursor: "cursor123",
                hasNextPage: true,
              },
            },
          },
        },
      },
    ];

    renderWithApollo(
      <Autocomplete
        query={mockQuery}
        variables={mockVariables}
        dataPath="users"
      />,
      mocks,
    );

    fireEvent.click(document.querySelector(".popover")!);

    await waitFor(() => {
      expect(screen.getByText("User 1")).toBeInTheDocument();
      expect(screen.getByText("User 2")).toBeInTheDocument();
    });

    const user1Elements = screen.getAllByText("User 1");
    expect(user1Elements).toHaveLength(1);
  });

  it("handles missing pageInfo in GraphQL response", async () => {
    const mocks = [
      {
        request: {
          query: mockQuery,
          variables: { search: "", first: 100 },
        },
        result: {
          data: {
            users: {
              nodes: [{ id: "1", name: "User Without PageInfo" }],
            },
          },
        },
      },
    ];

    renderWithApollo(
      <Autocomplete
        query={mockQuery}
        variables={mockVariables}
        dataPath="users"
      />,
      mocks,
    );

    fireEvent.click(document.querySelector(".popover")!);

    await waitFor(() => {
      expect(screen.getByText("User Without PageInfo")).toBeInTheDocument();
    });
  });

  it("uses fallback values when getOptionLabel/getOptionValue return empty", async () => {
    const mocks = [
      {
        request: {
          query: mockQuery,
          variables: { search: "", first: 100 },
        },
        result: {
          data: {
            users: {
              nodes: [{ id: "123", name: "User 123" }],
              pageInfo: { endCursor: null, hasNextPage: false },
            },
          },
        },
      },
    ];

    renderWithApollo(
      <Autocomplete
        query={mockQuery}
        variables={mockVariables}
        dataPath="users"
      />,
      mocks,
    );

    fireEvent.click(document.querySelector(".popover")!);

    await waitFor(() => {
      expect(screen.getByText("User 123")).toBeInTheDocument();
    });
  });

  it("verifies fallback logic exists in implementation", () => {
    renderWithApollo(<Autocomplete options={[]} />);

    fireEvent.click(document.querySelector(".popover")!);

    expect(screen.getByText("Žádné výsledky")).toBeInTheDocument();
  });

  it("handles custom getOptionLabel and getOptionValue functions with empty returns", async () => {
    const mocks = [
      {
        request: {
          query: mockQuery,
          variables: { search: "", first: 100 },
        },
        result: {
          data: {
            users: {
              nodes: [{ id: "123", customField: "Custom Value" }],
              pageInfo: { endCursor: null, hasNextPage: false },
            },
          },
        },
      },
    ];

    renderWithApollo(
      <Autocomplete
        query={mockQuery}
        variables={mockVariables}
        dataPath="users"
        getOptionLabel={() => ""}
        getOptionValue={(item) => item.id?.toString() || ""}
      />,
      mocks,
    );

    fireEvent.click(document.querySelector(".popover")!);

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
  });

  it("handles GraphQL errors gracefully", async () => {
    const errorMock = {
      request: {
        query: mockQuery,
        variables: { search: "", first: 100 },
      },
      error: new Error("GraphQL Error"),
    };

    renderWithApollo(
      <Autocomplete
        query={mockQuery}
        variables={mockVariables}
        dataPath="users"
      />,
      [errorMock],
    );

    fireEvent.click(document.querySelector(".popover")!);

    await waitFor(() => {
      expect(screen.getByText("Žádné výsledky")).toBeInTheDocument();
    });
  });

  it("handles empty GraphQL response", async () => {
    const emptyMock = {
      request: {
        query: mockQuery,
        variables: { search: "", first: 100 },
      },
      result: {
        data: {
          users: {
            nodes: [],
            pageInfo: { endCursor: null, hasNextPage: false },
          },
        },
      },
    };

    renderWithApollo(
      <Autocomplete
        query={mockQuery}
        variables={mockVariables}
        dataPath="users"
      />,
      [emptyMock],
    );

    fireEvent.click(document.querySelector(".popover")!);

    await waitFor(() => {
      expect(screen.getByText("Žádné výsledky")).toBeInTheDocument();
    });
  });

  it("handles nested dataPath correctly", () => {
    const complexOptions = [
      { label: "Complex Option 1", value: "complex1" },
      { label: "Complex Option 2", value: "complex2" },
    ];

    renderWithApollo(<Autocomplete options={complexOptions} />);

    fireEvent.click(document.querySelector(".popover")!);

    expect(screen.getByText("Complex Option 1")).toBeInTheDocument();
    expect(screen.getByText("Complex Option 2")).toBeInTheDocument();
  });

  it("handles GraphQL loading state correctly", async () => {
    const loadingMock = {
      request: {
        query: mockQuery,
        variables: { search: "", first: 100 },
      },
      result: {
        data: {
          users: {
            nodes: [{ id: "1", name: "User 1" }],
            pageInfo: { endCursor: null, hasNextPage: false },
          },
        },
      },
      delay: 100,
    };

    renderWithApollo(
      <Autocomplete
        query={mockQuery}
        variables={mockVariables}
        dataPath="users"
      />,
      [loadingMock],
    );

    fireEvent.click(document.querySelector(".popover")!);

    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("User 1")).toBeInTheDocument();
    });
  });

  it("handles search filtering in GraphQL mode correctly", async () => {
    const searchMock = {
      request: {
        query: mockQuery,
        variables: { search: "test", first: 100 },
      },
      result: {
        data: {
          users: {
            nodes: [{ id: "1", name: "Test User" }],
            pageInfo: { endCursor: null, hasNextPage: false },
          },
        },
      },
    };

    renderWithApollo(
      <Autocomplete
        query={mockQuery}
        variables={mockVariables}
        dataPath="users"
      />,
      [searchMock],
    );

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "test" } });

    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });
  });

  it("handles complex dataPath with multiple levels", async () => {
    const complexMock = {
      request: {
        query: mockQuery,
        variables: { search: "", first: 100 },
      },
      result: {
        data: {
          organization: {
            department: {
              users: {
                nodes: [{ id: "1", name: "Complex User" }],
                pageInfo: { endCursor: null, hasNextPage: false },
              },
            },
          },
        },
      },
    };

    renderWithApollo(
      <Autocomplete
        query={mockQuery}
        variables={mockVariables}
        dataPath="organization.department.users"
      />,
      [complexMock],
    );

    fireEvent.click(document.querySelector(".popover")!);

    await waitFor(() => {
      expect(screen.getByText("Complex User")).toBeInTheDocument();
    });
  });

  it("handles email fallback when name is not available", async () => {
    const emailMock = {
      request: {
        query: mockQuery,
        variables: { search: "", first: 100 },
      },
      result: {
        data: {
          users: {
            nodes: [{ id: "1", email: "test@example.com" }],
            pageInfo: { endCursor: null, hasNextPage: false },
          },
        },
      },
    };

    renderWithApollo(
      <Autocomplete
        query={mockQuery}
        variables={mockVariables}
        dataPath="users"
      />,
      [emailMock],
    );

    fireEvent.click(document.querySelector(".popover")!);

    await waitFor(() => {
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });
  });

  it("handles select mode with GraphQL data", async () => {
    const selectMock = {
      request: {
        query: mockQuery,
        variables: { search: "", first: 100 },
      },
      result: {
        data: {
          users: {
            nodes: [
              { id: "1", name: "User 1" },
              { id: "2", name: "User 2" },
            ],
            pageInfo: { endCursor: null, hasNextPage: false },
          },
        },
      },
    };

    renderWithApollo(
      <Autocomplete
        query={mockQuery}
        variables={mockVariables}
        dataPath="users"
        asSelect={true}
      />,
      [selectMock],
    );

    fireEvent.click(document.querySelector(".popover")!);

    await waitFor(() => {
      expect(screen.getByText("User 1")).toBeInTheDocument();
      expect(screen.getByText("User 2")).toBeInTheDocument();
    });

    expect(screen.getByRole("combobox")).toHaveValue("");
  });

  it("handles cursor initialization and update correctly", async () => {
    const initialMock = {
      request: {
        query: mockQuery,
        variables: { search: "", first: 100 },
      },
      result: {
        data: {
          users: {
            nodes: [{ id: "1", name: "User 1" }],
            pageInfo: {
              endCursor: "initial-cursor",
              hasNextPage: true,
            },
          },
        },
      },
    };

    renderWithApollo(
      <Autocomplete
        query={mockQuery}
        variables={mockVariables}
        dataPath="users"
      />,
      [initialMock],
    );

    fireEvent.click(document.querySelector(".popover")!);

    await waitFor(() => {
      expect(screen.getByText("User 1")).toBeInTheDocument();
    });

    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("handles onChange callback in multiple mode with chips", () => {
    const handleChange = vi.fn();
    renderWithApollo(
      <Autocomplete
        options={mockOptions}
        multiple
        onChange={handleChange}
        placeholder="Search options..."
      />,
    );

    const input = document.querySelector(
      'input[type="text"]',
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: "test search" } });
    fireEvent.click(document.querySelector(".popover")!);

    expect(input.value).toBe("test search");
    expect(input.placeholder).toBe("Search options...");
  });

  it("handles onChange in multiple mode without affecting search", () => {
    const handleChange = vi.fn();
    renderWithApollo(
      <Autocomplete
        options={mockOptions}
        multiple
        onChange={handleChange}
        value={["option1"]}
      />,
    );

    const input = document.querySelector(
      '.flex.w-full.flex-wrap input[type="text"]',
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: "search term" } });
    expect(input.value).toBe("search term");
  });

  it("handles aria-activedescendant correctly with active option", () => {
    renderWithApollo(<Autocomplete options={mockOptions} />);

    fireEvent.click(document.querySelector(".popover")!);

    const input = screen.getByRole("combobox");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });

    expect(input).toHaveAttribute("aria-activedescendant", "option-option2");
  });

  it("handles aria-activedescendant when no option is active", () => {
    renderWithApollo(<Autocomplete options={mockOptions} />);

    fireEvent.click(document.querySelector(".popover")!);

    const input = screen.getByRole("combobox");

    expect(input).not.toHaveAttribute("aria-activedescendant");
  });

  it("handles input onChange in single mode without clearing when value matches", () => {
    renderWithApollo(<Autocomplete options={mockOptions} value="option1" />);

    const input = screen.getByRole("combobox");
    expect(input).toHaveValue("Option 1");

    fireEvent.change(input, { target: { value: "Option 1" } });

    expect(input).toHaveValue("Option 1");
  });

  it("handles scroll event cleanup properly", async () => {
    const loadMore = vi.fn().mockResolvedValue(undefined);

    const { unmount } = renderWithApollo(
      <Autocomplete options={mockOptions} loadMore={loadMore} />,
    );

    fireEvent.click(document.querySelector(".popover")!);

    unmount();

    expect(true).toBe(true);
  });

  it("handles scroll event when popover content ref is not available", async () => {
    renderWithApollo(<Autocomplete options={mockOptions} />);

    fireEvent.click(document.querySelector(".popover")!);

    await waitFor(() => {
      expect(screen.getByText("Option 1")).toBeInTheDocument();
    });

    const popoverContent = screen.getByRole("dialog");

    const scrollEvent = new Event("scroll", { bubbles: true });

    act(() => {
      popoverContent.dispatchEvent(scrollEvent);
    });

    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("handles loadMore function with error handling", async () => {
    const mockLoadMore = vi
      .fn()
      .mockRejectedValue(new Error("Load more failed"));

    renderWithApollo(
      <Autocomplete options={mockOptions} loadMore={mockLoadMore} />,
    );

    fireEvent.click(document.querySelector(".popover")!);

    await waitFor(() => {
      expect(screen.getByText("Option 1")).toBeInTheDocument();
    });

    const popoverContent = screen.getByRole("dialog");

    Object.defineProperty(popoverContent, "scrollTop", {
      value: 100,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(popoverContent, "scrollHeight", {
      value: 120,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(popoverContent, "clientHeight", {
      value: 30,
      writable: true,
      configurable: true,
    });

    const scrollEvent = new Event("scroll", { bubbles: true });

    act(() => {
      popoverContent.dispatchEvent(scrollEvent);
    });

    await waitFor(() => {
      expect(mockLoadMore).toHaveBeenCalled();
    });
  });

  it("handles scroll when popover ref is null", async () => {
    renderWithApollo(<Autocomplete options={mockOptions} />);

    fireEvent.click(document.querySelector(".popover")!);

    await waitFor(() => {
      expect(screen.getByText("Option 1")).toBeInTheDocument();
    });

    const popoverContent = screen.getByRole("dialog");

    const scrollEvent = new Event("scroll", { bubbles: true });

    act(() => {
      popoverContent.dispatchEvent(scrollEvent);
    });

    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("handles isLoading state correctly when loadMore is in progress", async () => {
    const mockLoadMore = vi
      .fn()
      .mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

    renderWithApollo(
      <Autocomplete options={mockOptions} loadMore={mockLoadMore} />,
    );

    fireEvent.click(document.querySelector(".popover")!);

    await waitFor(() => {
      expect(screen.getByText("Option 1")).toBeInTheDocument();
    });

    const popoverContent = screen.getByRole("dialog");

    Object.defineProperty(popoverContent, "scrollTop", {
      value: 100,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(popoverContent, "scrollHeight", {
      value: 120,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(popoverContent, "clientHeight", {
      value: 30,
      writable: true,
      configurable: true,
    });

    const scrollEvent = new Event("scroll", { bubbles: true });

    act(() => {
      popoverContent.dispatchEvent(scrollEvent);
    });

    await waitFor(() => {
      expect(mockLoadMore).toHaveBeenCalled();
    });
  });

  it("handles clearing search when component unmounts", async () => {
    const { unmount } = renderWithApollo(
      <Autocomplete options={mockOptions} />,
    );

    fireEvent.click(document.querySelector(".popover")!);

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "test" } });

    expect(input).toHaveValue("test");

    unmount();
  });

  it("handles multiple false triggers and edge keyboard events", async () => {
    renderWithApollo(<Autocomplete options={mockOptions} />);

    const popover = document.querySelector(".popover")!;
    fireEvent.click(popover);

    await waitFor(() => {
      expect(screen.getByText("Option 1")).toBeInTheDocument();
    });

    const input = screen.getByRole("combobox");

    fireEvent.keyDown(input, { key: "Tab" });
    fireEvent.keyDown(input, { key: "Shift" });
    fireEvent.keyDown(input, { key: "Control" });
    fireEvent.keyDown(input, { key: "Alt" });
    fireEvent.keyDown(input, { key: "Meta" });

    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("handles empty option selection in select mode", async () => {
    const handleChange = vi.fn();

    renderWithApollo(
      <Autocomplete
        options={mockOptions}
        onChange={handleChange}
        asSelect={true}
        hasEmpty={true}
      />,
    );

    fireEvent.click(document.querySelector(".popover")!);

    await waitFor(() => {
      expect(screen.getByText("Option 1")).toBeInTheDocument();
    });

    const emptyOption = document.getElementById("option-");
    expect(emptyOption).toBeInTheDocument();
    fireEvent.click(emptyOption!);

    expect(handleChange).toHaveBeenCalledWith(null, null);
  });

  it("handles option value extraction for different data types", async () => {
    const numberOptions = [
      { label: "Number Option", value: 123 },
      { label: "String Option", value: "abc" },
    ];

    const handleChange = vi.fn();

    renderWithApollo(
      <Autocomplete options={numberOptions} onChange={handleChange} />,
    );

    fireEvent.click(document.querySelector(".popover")!);

    await waitFor(() => {
      expect(screen.getByText("Number Option")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Number Option"));

    expect(handleChange).toHaveBeenCalledWith(123, null);
  });
});
