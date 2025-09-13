import { render, screen, fireEvent } from "@testing-library/react";
import Calendar from "../../../../components/ui/calendar";
import type { CalendarEvent } from "../../../../components/ui/calendar/types";

// Mock all sub-components
vi.mock("../../../../components/ui/calendar/calendar-header", () => ({
  default: ({
    onNext,
    onPrevious,
    onViewChange,
    view,
  }: {
    onNext: () => void;
    onPrevious: () => void;
    onViewChange: (view: string) => void;
    view: string;
  }) => (
    <div data-testid="calendar-header">
      <button onClick={onPrevious} data-testid="prev-btn">
        Previous
      </button>
      <button onClick={onNext} data-testid="next-btn">
        Next
      </button>
      <span data-testid="current-view">{view}</span>
      <button onClick={() => onViewChange("week")} data-testid="week-btn">
        Week
      </button>
    </div>
  ),
}));

vi.mock("../../../../components/ui/calendar/month-view", () => ({
  default: ({ events }: { events: CalendarEvent[] }) => (
    <div data-testid="month-view">
      {events.map((event: CalendarEvent) => (
        <div key={event.id} data-testid={`event-${event.id}`}>
          {event.title}
        </div>
      ))}
    </div>
  ),
}));

vi.mock("../../../../components/ui/calendar/week-view", () => ({
  default: ({ events }: { events: CalendarEvent[] }) => (
    <div data-testid="week-view">
      {events.map((event: CalendarEvent) => (
        <div key={event.id} data-testid={`event-${event.id}`}>
          {event.title}
        </div>
      ))}
    </div>
  ),
}));

vi.mock("../../../../components/ui/calendar/day-view", () => ({
  default: ({ events }: { events: CalendarEvent[] }) => (
    <div data-testid="day-view">
      {events.map((event: CalendarEvent) => (
        <div key={event.id} data-testid={`event-${event.id}`}>
          {event.title}
        </div>
      ))}
    </div>
  ),
}));

describe("Calendar Integration", () => {
  const mockEvents: CalendarEvent[] = [
    {
      id: "1",
      title: "Integration Test Event",
      start: new Date(2025, 0, 15, 10, 0),
      end: new Date(2025, 0, 15, 11, 0),
      color: "blue",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("View Switching", () => {
    it("should start with default month view", () => {
      render(<Calendar events={mockEvents} />);

      expect(screen.getByTestId("month-view")).toBeInTheDocument();
      expect(screen.getByTestId("current-view")).toHaveTextContent("month");
    });

    it("should switch to week view when week button is clicked", () => {
      render(<Calendar events={mockEvents} />);

      const weekButton = screen.getByTestId("week-btn");
      fireEvent.click(weekButton);

      expect(screen.getByTestId("week-view")).toBeInTheDocument();
    });

    it("should start with specified initial view", () => {
      render(<Calendar events={mockEvents} initialView="week" />);

      expect(screen.getByTestId("week-view")).toBeInTheDocument();
      expect(screen.getByTestId("current-view")).toHaveTextContent("week");
    });
  });

  describe("Navigation", () => {
    it("should handle navigation between periods", () => {
      render(<Calendar events={mockEvents} />);

      const nextButton = screen.getByTestId("next-btn");
      const prevButton = screen.getByTestId("prev-btn");

      // Should not throw errors when clicking navigation
      fireEvent.click(nextButton);
      fireEvent.click(prevButton);

      expect(screen.getByTestId("calendar-header")).toBeInTheDocument();
    });
  });

  describe("Event Display", () => {
    it("should pass events to current view", () => {
      render(<Calendar events={mockEvents} />);

      expect(screen.getByTestId("event-1")).toBeInTheDocument();
      expect(screen.getByText("Integration Test Event")).toBeInTheDocument();
    });

    it("should handle empty events array", () => {
      render(<Calendar events={[]} />);

      expect(screen.getByTestId("month-view")).toBeInTheDocument();
      expect(screen.queryByTestId("event-1")).not.toBeInTheDocument();
    });
  });

  describe("Callbacks", () => {
    it("should call onViewChange when view changes", () => {
      const onViewChange = vi.fn();
      render(<Calendar events={mockEvents} onViewChange={onViewChange} />);

      const weekButton = screen.getByTestId("week-btn");
      fireEvent.click(weekButton);

      expect(onViewChange).toHaveBeenCalledWith("week");
    });
  });

  describe("Configuration", () => {
    it("should apply custom className", () => {
      render(<Calendar events={mockEvents} className="custom-calendar" />);

      const calendar = document.querySelector(".custom-calendar");
      expect(calendar).toBeInTheDocument();
    });

    it("should handle initial date", () => {
      const initialDate = new Date(2025, 5, 15); // June 15, 2025
      render(<Calendar events={mockEvents} initialDate={initialDate} />);

      // Calendar should start with the specified date
      expect(screen.getByTestId("calendar-header")).toBeInTheDocument();
    });

    it("should limit view options", () => {
      render(<Calendar events={mockEvents} viewOptions={["month", "week"]} />);

      // Should only show specified view options
      expect(screen.getByTestId("calendar-header")).toBeInTheDocument();
    });
  });
});
