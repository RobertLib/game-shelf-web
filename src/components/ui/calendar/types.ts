import { getDictionary } from "../../../dictionaries";

export type CalendarView = "month" | "week" | "day";

export interface CalendarEvent {
  allDay?: boolean;
  color?: string;
  end: Date;
  id: string;
  start: Date;
  title: string;
  htmlTitle?: string;
  [key: string]: unknown;
}

export interface CalendarViewProps {
  currentDate: Date;
  dict: Awaited<ReturnType<typeof getDictionary>>;
  events: CalendarEvent[];
  maxDate?: Date;
  minDate?: Date;
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}
