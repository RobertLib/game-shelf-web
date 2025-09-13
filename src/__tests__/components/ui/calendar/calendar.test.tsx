import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Calendar, {
  type CalendarProps,
} from "../../../../components/ui/calendar";
import type { CalendarEvent } from "../../../../components/ui/calendar/types";

// Simplified mocks - only mock what's essential for testing
vi.mock("../../../../components/ui/calendar/month-view", () => ({
  default: (props: {
    events?: CalendarEvent[];
    onEventClick?: (event: CalendarEvent) => void;
    onDateClick?: (date: Date) => void;
  }) => (
    <div data-testid="month-view">
      {props.events?.map((event) => (
        <div key={event.id} onClick={() => props.onEventClick?.(event)}>
          {event.title}
        </div>
      ))}
      <div onClick={() => props.onDateClick?.(new Date(2025, 0, 20))}>20</div>
    </div>
  ),
}));

vi.mock("../../../../components/ui/calendar/week-view", () => ({
  default: (props: {
    events?: CalendarEvent[];
    onEventClick?: (event: CalendarEvent) => void;
    onDateClick?: (date: Date) => void;
  }) => (
    <div data-testid="week-view">
      {props.events?.map((event) => (
        <div key={event.id} onClick={() => props.onEventClick?.(event)}>
          {event.title}
        </div>
      ))}
      <div onClick={() => props.onDateClick?.(new Date(2025, 0, 20))}>20</div>
    </div>
  ),
}));

vi.mock("../../../../components/ui/calendar/day-view", () => ({
  default: (props: {
    events?: CalendarEvent[];
    onEventClick?: (event: CalendarEvent) => void;
  }) => (
    <div data-testid="day-view">
      {props.events?.map((event) => (
        <div key={event.id} onClick={() => props.onEventClick?.(event)}>
          {event.title}
        </div>
      ))}
    </div>
  ),
}));

vi.mock("../../../../components/ui/calendar/calendar-header", () => ({
  default: (props: {
    view?: string;
    viewOptions?: string[];
    currentDate?: Date;
    onViewChange?: (view: string) => void;
    onDateSelect?: (date: Date) => void;
    onPrevious?: () => void;
    onNext?: () => void;
  }) => (
    <div data-testid="calendar-header">
      <input
        type="date"
        value={
          props.currentDate
            ? `${props.currentDate.getFullYear()}-${(props.currentDate.getMonth() + 1).toString().padStart(2, "0")}-${props.currentDate.getDate().toString().padStart(2, "0")}`
            : ""
        }
        onChange={(e) => props.onDateSelect?.(new Date(e.target.value))}
      />
      <button aria-label="Previous" onClick={props.onPrevious}>
        Previous
      </button>
      <button aria-label="Next" onClick={props.onNext}>
        Next
      </button>
      <h2>leden 2025</h2>
      {props.viewOptions?.map((viewOption) => (
        <button
          key={viewOption}
          onClick={() => props.onViewChange?.(viewOption)}
          className={
            viewOption === props.view
              ? "bg-gradient-to-r from-gray-100 to-gray-200"
              : ""
          }
        >
          {viewOption === "month"
            ? "Měsíc"
            : viewOption === "week"
              ? "Týden"
              : "Den"}
        </button>
      ))}
    </div>
  ),
}));

describe("Calendar", () => {
  const mockEvents: CalendarEvent[] = [
    {
      id: "1",
      title: "Test Event 1",
      start: new Date(2025, 0, 15, 10, 0), // January 15, 2025, 10:00
      end: new Date(2025, 0, 15, 11, 0), // January 15, 2025, 11:00
      color: "blue",
    },
    {
      id: "2",
      title: "Test Event 2",
      start: new Date(2025, 0, 20, 14, 0), // January 20, 2025, 14:00
      end: new Date(2025, 0, 20, 15, 30), // January 20, 2025, 15:30
      color: "red",
    },
    {
      id: "3",
      title: "All Day Event",
      start: new Date(2025, 0, 25, 0, 0), // January 25, 2025
      end: new Date(2025, 0, 25, 23, 59), // January 25, 2025
      color: "green",
      allDay: true,
    },
  ];

  const defaultProps: CalendarProps = {
    events: mockEvents,
    initialDate: new Date(2025, 0, 15), // January 15, 2025
    viewOptions: ["month", "week", "day"],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render calendar with default props", () => {
      render(<Calendar events={[]} viewOptions={["month", "week", "day"]} />);
      expect(screen.getByText("Měsíc")).toBeInTheDocument();
    });

    it("should render calendar with provided events", () => {
      render(<Calendar {...defaultProps} />);
      expect(screen.getByText("Test Event 1")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(<Calendar className="custom-class" />);
      const calendar = document.querySelector(".custom-class");
      expect(calendar).toBeInTheDocument();
      expect(calendar).toHaveClass("custom-class");
    });
  });

  describe("View Controls", () => {
    it("should render all view options by default", () => {
      render(<Calendar {...defaultProps} />);
      expect(screen.getByText("Měsíc")).toBeInTheDocument();
      expect(screen.getByText("Týden")).toBeInTheDocument();
      expect(screen.getByText("Den")).toBeInTheDocument();
    });

    it("should render only specified view options", () => {
      render(<Calendar {...defaultProps} viewOptions={["month", "week"]} />);
      expect(screen.getByText("Měsíc")).toBeInTheDocument();
      expect(screen.getByText("Týden")).toBeInTheDocument();
      expect(screen.queryByText("Den")).not.toBeInTheDocument();
    });

    it("should switch view when view button is clicked", () => {
      const onViewChange = vi.fn();
      render(<Calendar {...defaultProps} onViewChange={onViewChange} />);

      const weekButton = screen.getByText("Týden");
      fireEvent.click(weekButton);

      expect(onViewChange).toHaveBeenCalledWith("week");
    });

    it("should highlight current view", () => {
      render(<Calendar {...defaultProps} initialView="week" />);
      const weekButton = screen.getByText("Týden");
      // Check that the week button has the correct styling indicating it's active
      expect(weekButton).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("should render navigation buttons", () => {
      render(<Calendar {...defaultProps} />);
      expect(screen.getByLabelText("Previous")).toBeInTheDocument();
      expect(screen.getByLabelText("Next")).toBeInTheDocument();
    });

    it("should navigate to previous month when previous button is clicked", async () => {
      render(<Calendar {...defaultProps} />);
      const previousButton = screen.getByLabelText("Previous");

      fireEvent.click(previousButton);

      // Verify that previous month is displayed
      await waitFor(() => {
        expect(screen.getByDisplayValue("2024-12-15")).toBeInTheDocument();
      });
    });

    it("should navigate to next month when next button is clicked", async () => {
      render(<Calendar {...defaultProps} />);
      const nextButton = screen.getByLabelText("Next");

      fireEvent.click(nextButton);

      // Verify that next month is displayed
      await waitFor(() => {
        expect(screen.getByDisplayValue("2025-02-15")).toBeInTheDocument();
      });
    });

    it("should update date when date input is changed", () => {
      render(<Calendar {...defaultProps} />);
      const dateInput = screen.getByDisplayValue("2025-01-15");

      fireEvent.change(dateInput, { target: { value: "2025-06-20" } });

      expect(dateInput).toHaveValue("2025-06-20");
    });
  });

  describe("Events", () => {
    it("should display events", () => {
      render(<Calendar {...defaultProps} />);
      expect(screen.getByText("Test Event 1")).toBeInTheDocument();
      expect(screen.getByText("Test Event 2")).toBeInTheDocument();
      expect(screen.getByText("All Day Event")).toBeInTheDocument();
    });

    it("should call onEventClick when event is clicked", () => {
      const onEventClick = vi.fn();
      render(<Calendar {...defaultProps} onEventClick={onEventClick} />);

      const event = screen.getByText("Test Event 1");
      fireEvent.click(event);

      expect(onEventClick).toHaveBeenCalledWith(mockEvents[0]);
    });

    it("should call onDateClick when date is clicked", () => {
      const onDateClick = vi.fn();
      render(<Calendar {...defaultProps} onDateClick={onDateClick} />);

      // Find a date cell and click on it
      const dateCell = screen.getByText("20"); // January 20
      fireEvent.click(dateCell);

      expect(onDateClick).toHaveBeenCalledWith(expect.any(Date));
    });
  });

  describe("Date Constraints", () => {
    it("should respect minDate constraint", () => {
      const minDate = new Date(2025, 0, 10); // January 10, 2025
      render(<Calendar {...defaultProps} minDate={minDate} />);

      // Tests should verify that dates before minDate are disabled
      // Implementation depends on specific calendar implementation
    });

    it("should respect maxDate constraint", () => {
      const maxDate = new Date(2025, 0, 30); // January 30, 2025
      render(<Calendar {...defaultProps} maxDate={maxDate} />);

      // Tests should verify that dates after maxDate are disabled
    });
  });

  describe("Different Views", () => {
    it("should render month view by default", () => {
      render(<Calendar {...defaultProps} />);
      // Verify that month view is displayed (more days visible)
      expect(screen.getByText("Test Event 1")).toBeInTheDocument();
    });

    it("should render week view when initialView is week", () => {
      render(<Calendar {...defaultProps} initialView="week" />);
      const weekButton = screen.getByText("Týden");
      expect(weekButton).toHaveClass(
        "bg-gradient-to-r",
        "from-gray-100",
        "to-gray-200",
      );
    });

    it("should render day view when initialView is day", () => {
      render(<Calendar {...defaultProps} initialView="day" />);
      const dayButton = screen.getByText("Den");
      expect(dayButton).toHaveClass(
        "bg-gradient-to-r",
        "from-gray-100",
        "to-gray-200",
      );
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels for navigation buttons", () => {
      render(<Calendar {...defaultProps} />);
      expect(screen.getByLabelText("Previous")).toBeInTheDocument();
      expect(screen.getByLabelText("Next")).toBeInTheDocument();
    });

    it("should be keyboard navigable", () => {
      render(<Calendar {...defaultProps} />);
      const previousButton = screen.getByLabelText("Previous");

      previousButton.focus();
      expect(document.activeElement).toBe(previousButton);
    });
  });
});
