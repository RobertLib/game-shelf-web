import { render, screen, fireEvent } from "@testing-library/react";
import DateCell, {
  type DateCellProps,
} from "../../../../components/ui/calendar/date-cell";
import type { CalendarEvent } from "../../../../components/ui/calendar/types";

// Mock dependencies
vi.mock("../../../../components/ui", () => ({
  Tooltip: ({
    children,
    content,
  }: {
    children: React.ReactNode;
    content: string;
  }) => (
    <div data-testid="tooltip" title={content}>
      {children}
    </div>
  ),
}));

vi.mock("../../../../components/ui/calendar/utils", () => ({
  getColorStyles: (color: string) => [`bg-${color}-100`, `border-${color}-300`],
}));

describe("DateCell", () => {
  const mockDict = {
    more: "další",
  };

  const defaultProps: DateCellProps = {
    date: new Date(2025, 0, 15), // January 15, 2025
    dict: mockDict as DateCellProps["dict"],
    disabled: false,
    events: [],
    isCurrentMonth: true,
    isToday: false,
    onDateClick: vi.fn(),
    onEventClick: vi.fn(),
  };

  const mockEvents: CalendarEvent[] = [
    {
      id: "1",
      title: "Meeting 1",
      timeText: "09:00-10:00",
      color: "blue",
      start: new Date(2025, 0, 15, 9, 0),
      end: new Date(2025, 0, 15, 10, 0),
    },
    {
      id: "2",
      title: "Meeting 2",
      timeText: "11:00-12:00",
      color: "red",
      start: new Date(2025, 0, 15, 11, 0),
      end: new Date(2025, 0, 15, 12, 0),
    },
    {
      id: "3",
      title: "Meeting 3",
      timeText: "13:00-14:00",
      color: "green",
      start: new Date(2025, 0, 15, 13, 0),
      end: new Date(2025, 0, 15, 14, 0),
    },
    {
      id: "4",
      title: "Meeting 4",
      timeText: "15:00-16:00",
      color: "yellow",
      start: new Date(2025, 0, 15, 15, 0),
      end: new Date(2025, 0, 15, 16, 0),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders date cell with correct day number", () => {
    render(<DateCell {...defaultProps} />);
    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("applies correct styling for current month", () => {
    const { container } = render(<DateCell {...defaultProps} />);
    const cell = container.firstChild as HTMLElement;
    expect(cell).toHaveClass("date-cell");
    expect(cell).not.toHaveClass("bg-gray-50");
  });

  it("applies correct styling for non-current month", () => {
    const { container } = render(
      <DateCell {...defaultProps} isCurrentMonth={false} />,
    );
    const cell = container.firstChild as HTMLElement;
    expect(cell).toHaveClass("bg-gray-50", "text-gray-400");
  });

  it("applies correct styling for today", () => {
    render(<DateCell {...defaultProps} isToday={true} />);
    const dayElement = screen.getByText("15");
    expect(dayElement).toHaveClass("bg-primary-500", "text-white");
  });

  it("applies correct styling for disabled state", () => {
    const { container } = render(
      <DateCell {...defaultProps} disabled={true} />,
    );
    const cell = container.firstChild as HTMLElement;
    expect(cell).toHaveClass("cursor-not-allowed", "opacity-60");
  });

  it("calls onDateClick when cell is clicked", () => {
    const mockOnDateClick = vi.fn();
    const { container } = render(
      <DateCell {...defaultProps} onDateClick={mockOnDateClick} />,
    );

    fireEvent.click(container.firstChild as HTMLElement);
    expect(mockOnDateClick).toHaveBeenCalledTimes(1);
    expect(mockOnDateClick).toHaveBeenCalledWith(defaultProps.date);
  });

  it("does not call onDateClick when disabled", () => {
    const mockOnDateClick = vi.fn();
    const { container } = render(
      <DateCell
        {...defaultProps}
        disabled={true}
        onDateClick={mockOnDateClick}
      />,
    );

    fireEvent.click(container.firstChild as HTMLElement);
    expect(mockOnDateClick).not.toHaveBeenCalled();
  });

  it("renders events correctly", () => {
    render(<DateCell {...defaultProps} events={mockEvents.slice(0, 2)} />);

    expect(screen.getByText("Meeting 1")).toBeInTheDocument();
    expect(screen.getByText("Meeting 2")).toBeInTheDocument();
  });

  it("shows maximum 3 events and displays 'more' indicator", () => {
    render(<DateCell {...defaultProps} events={mockEvents} />);

    // Should show first 3 events
    expect(screen.getByText("Meeting 1")).toBeInTheDocument();
    expect(screen.getByText("Meeting 2")).toBeInTheDocument();
    expect(screen.getByText("Meeting 3")).toBeInTheDocument();

    // Should not show the 4th event
    expect(screen.queryByText("Meeting 4")).not.toBeInTheDocument();

    // Should show "more" indicator
    expect(screen.getByText("+1 další")).toBeInTheDocument();
  });

  it("calls onEventClick when event is clicked", () => {
    const mockOnEventClick = vi.fn();
    render(
      <DateCell
        {...defaultProps}
        events={mockEvents.slice(0, 1)}
        onEventClick={mockOnEventClick}
      />,
    );

    fireEvent.click(screen.getByText("Meeting 1"));
    expect(mockOnEventClick).toHaveBeenCalledTimes(1);
    expect(mockOnEventClick).toHaveBeenCalledWith(mockEvents[0]);
  });

  it("stops propagation when event is clicked", () => {
    const mockOnDateClick = vi.fn();
    const mockOnEventClick = vi.fn();
    render(
      <DateCell
        {...defaultProps}
        events={mockEvents.slice(0, 1)}
        onDateClick={mockOnDateClick}
        onEventClick={mockOnEventClick}
      />,
    );

    fireEvent.click(screen.getByText("Meeting 1"));
    expect(mockOnEventClick).toHaveBeenCalledTimes(1);
    expect(mockOnDateClick).not.toHaveBeenCalled();
  });

  it("renders tooltips for events", () => {
    render(<DateCell {...defaultProps} events={mockEvents.slice(0, 1)} />);

    const tooltip = screen.getByTestId("tooltip");
    expect(tooltip).toHaveAttribute("title", "Meeting 1 (09:00-10:00)");
  });

  it("handles missing onDateClick prop", () => {
    const { container } = render(
      <DateCell {...defaultProps} onDateClick={undefined} />,
    );

    // Should not throw error when clicked
    expect(() => {
      fireEvent.click(container.firstChild as HTMLElement);
    }).not.toThrow();
  });

  it("handles missing onEventClick prop", () => {
    render(
      <DateCell
        {...defaultProps}
        events={mockEvents.slice(0, 1)}
        onEventClick={undefined}
      />,
    );

    // Should not throw error when event is clicked
    expect(() => {
      fireEvent.click(screen.getByText("Meeting 1"));
    }).not.toThrow();
  });

  it("renders correct number of events when less than max", () => {
    const twoEvents = mockEvents.slice(0, 2);
    render(<DateCell {...defaultProps} events={twoEvents} />);

    expect(screen.getByText("Meeting 1")).toBeInTheDocument();
    expect(screen.getByText("Meeting 2")).toBeInTheDocument();
    expect(screen.queryByText("+")).not.toBeInTheDocument();
  });

  it("applies hover styles for non-disabled cells", () => {
    const { container } = render(<DateCell {...defaultProps} />);
    const cell = container.firstChild as HTMLElement;
    expect(cell).toHaveClass("cursor-pointer", "hover:bg-gray-100/30");
  });
});
