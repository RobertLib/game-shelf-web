import { getDictionary } from "../../../dictionaries";
import { type CalendarEvent, type CalendarView } from "./types";
import { useCallback, useMemo, useState } from "react";
import CalendarHeader from "./calendar-header";
import cn from "../../../utils/cn";
import DayView from "./day-view";
import MonthView from "./month-view";
import WeekView from "./week-view";

export interface CalendarProps {
  className?: string;
  currentDate?: Date;
  events?: CalendarEvent[];
  initialDate?: Date;
  initialView?: CalendarView;
  maxDate?: Date;
  minDate?: Date;
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onViewChange?: (view: CalendarView) => void;
  setCurrentDate?: (date: Date) => void;
  viewOptions?: CalendarView[];
}

export default function Calendar({
  className = "",
  currentDate: externalCurrentDate,
  events = [],
  initialDate,
  initialView = "month",
  maxDate,
  minDate,
  onDateClick,
  onEventClick,
  onViewChange,
  setCurrentDate: externalSetCurrentDate,
  viewOptions = ["month", "week", "day"],
}: CalendarProps) {
  // Default to current date if no initialDate provided
  const [internalCurrentDate, setInternalCurrentDate] = useState(
    initialDate || new Date(),
  );

  // Use external currentDate if provided, otherwise use internal state
  const currentDate = externalCurrentDate ?? internalCurrentDate;
  const [view, setView] = useState<CalendarView>(initialView);

  const dict = getDictionary();

  const handlePrevious = useCallback(() => {
    if (externalSetCurrentDate) {
      // External setter - just pass the new date
      const newDate = new Date(currentDate);
      if (view === "month") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else if (view === "week") {
        newDate.setDate(newDate.getDate() - 7);
      } else {
        newDate.setDate(newDate.getDate() - 1);
      }
      externalSetCurrentDate(newDate);
    } else {
      // Internal setter - can use callback form
      setInternalCurrentDate((prevDate) => {
        const newDate = new Date(prevDate);
        if (view === "month") {
          newDate.setMonth(newDate.getMonth() - 1);
        } else if (view === "week") {
          newDate.setDate(newDate.getDate() - 7);
        } else {
          newDate.setDate(newDate.getDate() - 1);
        }
        return newDate;
      });
    }
  }, [view, currentDate, externalSetCurrentDate]);

  const handleNext = useCallback(() => {
    if (externalSetCurrentDate) {
      // External setter - just pass the new date
      const newDate = new Date(currentDate);
      if (view === "month") {
        newDate.setMonth(newDate.getMonth() + 1);
      } else if (view === "week") {
        newDate.setDate(newDate.getDate() + 7);
      } else {
        newDate.setDate(newDate.getDate() + 1);
      }
      externalSetCurrentDate(newDate);
    } else {
      // Internal setter - can use callback form
      setInternalCurrentDate((prevDate) => {
        const newDate = new Date(prevDate);
        if (view === "month") {
          newDate.setMonth(newDate.getMonth() + 1);
        } else if (view === "week") {
          newDate.setDate(newDate.getDate() + 7);
        } else {
          newDate.setDate(newDate.getDate() + 1);
        }
        return newDate;
      });
    }
  }, [view, currentDate, externalSetCurrentDate]);

  const handleDateSelect = useCallback(
    (date: Date) => {
      if (externalSetCurrentDate) {
        externalSetCurrentDate(date);
      } else {
        setInternalCurrentDate(date);
      }
    },
    [externalSetCurrentDate],
  );

  const handleViewChange = useCallback(
    (newView: CalendarView) => {
      setView(newView);
      onViewChange?.(newView);
    },
    [onViewChange],
  );

  const viewComponent = useMemo(() => {
    const viewProps = {
      currentDate,
      dict,
      events,
      maxDate,
      minDate,
      onDateClick,
      onEventClick,
    };

    switch (view) {
      case "month":
        return <MonthView {...viewProps} />;
      case "week":
        return <WeekView {...viewProps} />;
      case "day":
        return <DayView {...viewProps} />;
      default:
        return <MonthView {...viewProps} />;
    }
  }, [
    currentDate,
    dict,
    events,
    maxDate,
    minDate,
    onDateClick,
    onEventClick,
    view,
  ]);

  return (
    <div
      className={cn(
        "border-secondary-200 dark:border-secondary-700 bg-surface flex flex-col overflow-hidden border shadow",
        className,
      )}
    >
      <CalendarHeader
        currentDate={currentDate}
        dict={dict}
        onDateSelect={handleDateSelect}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onViewChange={handleViewChange}
        view={view}
        viewOptions={viewOptions}
      />
      <div className="flex-1">{viewComponent}</div>
    </div>
  );
}
