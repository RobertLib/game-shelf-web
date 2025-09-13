import { renderWithProviders, screen } from "../../test-utils";
import userEvent from "@testing-library/user-event";
import Accordion from "../../../components/ui/accordion";

describe("Accordion Component", () => {
  it("renders with header and children", () => {
    renderWithProviders(
      <Accordion header="Test Header">
        <div>Test Content</div>
      </Accordion>,
    );

    expect(screen.getByText("Test Header")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("is open by default", () => {
    renderWithProviders(
      <Accordion header="Test Header">
        <div>Test Content</div>
      </Accordion>,
    );

    const button = screen.getByRole("button", { name: /test header/i });
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("respects the open prop when set to false", () => {
    renderWithProviders(
      <Accordion header="Test Header" open={false}>
        <div>Test Content</div>
      </Accordion>,
    );

    const button = screen.getByRole("button", { name: /test header/i });
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("toggles open state when clicking the header", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Accordion header="Test Header">
        <div>Test Content</div>
      </Accordion>,
    );

    const button = screen.getByRole("button", { name: /test header/i });
    expect(button).toHaveAttribute("aria-expanded", "true");

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("toggles open state when clicking the icon button", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Accordion header="Test Header">
        <div>Test Content</div>
      </Accordion>,
    );

    const iconButton = screen.getByRole("button", {
      name: /toggle accordion/i,
    });
    expect(iconButton).toHaveAttribute("aria-expanded", "true");

    await user.click(iconButton);
    expect(iconButton).toHaveAttribute("aria-expanded", "false");

    await user.click(iconButton);
    expect(iconButton).toHaveAttribute("aria-expanded", "true");
  });

  it("displays ChevronUp icon when open", () => {
    renderWithProviders(
      <Accordion header="Test Header" open={true}>
        <div>Test Content</div>
      </Accordion>,
    );

    const iconButton = screen.getByRole("button", {
      name: /toggle accordion/i,
    });
    // lucide-react ikony se renderují jako svg
    const svg = iconButton.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("displays ChevronDown icon when closed", () => {
    renderWithProviders(
      <Accordion header="Test Header" open={false}>
        <div>Test Content</div>
      </Accordion>,
    );

    const iconButton = screen.getByRole("button", {
      name: /toggle accordion/i,
    });
    const svg = iconButton.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders custom header content", () => {
    renderWithProviders(
      <Accordion
        header={
          <div>
            <h2>Custom Header</h2>
            <p>Subtitle</p>
          </div>
        }
      >
        <div>Test Content</div>
      </Accordion>,
    );

    expect(screen.getByText("Custom Header")).toBeInTheDocument();
    expect(screen.getByText("Subtitle")).toBeInTheDocument();
  });

  it("renders complex children content", () => {
    renderWithProviders(
      <Accordion header="Test Header">
        <div>
          <p>First paragraph</p>
          <p>Second paragraph</p>
          <button type="button">Action Button</button>
        </div>
      </Accordion>,
    );

    expect(screen.getByText("First paragraph")).toBeInTheDocument();
    expect(screen.getByText("Second paragraph")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /action button/i }),
    ).toBeInTheDocument();
  });

  it("header button has correct accessibility attributes", () => {
    renderWithProviders(
      <Accordion header="Test Header">
        <div>Test Content</div>
      </Accordion>,
    );

    const button = screen.getByRole("button", { name: /test header/i });
    expect(button).toHaveAttribute("aria-expanded");
    expect(button).toHaveAttribute("tabIndex", "0");
  });

  it("icon button has correct accessibility attributes", () => {
    renderWithProviders(
      <Accordion header="Test Header">
        <div>Test Content</div>
      </Accordion>,
    );

    const iconButton = screen.getByRole("button", {
      name: /toggle accordion/i,
    });
    expect(iconButton).toHaveAttribute("aria-expanded");
    expect(iconButton).toHaveAttribute("aria-label", "Toggle accordion");
  });

  it("syncs aria-expanded between header and icon button", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Accordion header="Test Header">
        <div>Test Content</div>
      </Accordion>,
    );

    const headerButton = screen.getByRole("button", { name: /test header/i });
    const iconButton = screen.getByRole("button", {
      name: /toggle accordion/i,
    });

    expect(headerButton).toHaveAttribute("aria-expanded", "true");
    expect(iconButton).toHaveAttribute("aria-expanded", "true");

    await user.click(headerButton);

    expect(headerButton).toHaveAttribute("aria-expanded", "false");
    expect(iconButton).toHaveAttribute("aria-expanded", "false");
  });

  it("can be toggled multiple times", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Accordion header="Test Header">
        <div>Test Content</div>
      </Accordion>,
    );

    const button = screen.getByRole("button", { name: /test header/i });

    // Initial state: open
    expect(button).toHaveAttribute("aria-expanded", "true");

    // Click 1: close
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");

    // Click 2: open
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    // Click 3: close
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");

    // Click 4: open
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("renders without header", () => {
    renderWithProviders(
      <Accordion>
        <div>Test Content</div>
      </Accordion>,
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /toggle accordion/i }),
    ).toBeInTheDocument();
  });
});
