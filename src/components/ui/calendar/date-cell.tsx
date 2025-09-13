import { getColorStyles } from "./utils";
import { getDictionary } from "../../../dictionaries";
import { Tooltip } from "..";
import { type CalendarEvent } from "./types";
import cn from "../../../utils/cn";

export interface DateCellProps {
  date: Date;
  dict: Awaited<ReturnType<typeof getDictionary>>;
  disabled?: boolean;
  events: CalendarEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export default function DateCell({
  date,
  dict,
  disabled = false,
  events,
  isCurrentMonth,
  isToday,
  onDateClick,
  onEventClick,
}: DateCellProps) {
  const dayNumber = date.getDate();

  const maxVisibleEvents = 3;
  const hasMoreEvents = events.length > maxVisibleEvents;
  const visibleEvents = events.slice(0, maxVisibleEvents);

  const handleDateClick = () => {
    if (!disabled && onDateClick) {
      onDateClick(date);
    }
  };

  return (
    <div
      className={cn(
        "date-cell relative h-32 overflow-hidden border-r border-neutral-200 p-1 transition-colors",
        !isCurrentMonth && "bg-gray-50 text-gray-400 dark:bg-gray-800",
        isToday && "bg-primary-50 dark:bg-primary-900/30",
        disabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer hover:bg-gray-100/30 dark:hover:bg-gray-700/30",
      )}
      onClick={handleDateClick}
    >
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "inline-block h-6 w-6 rounded-full text-center",
            isToday && "bg-primary-500 text-white",
          )}
        >
          {dayNumber}
        </span>
      </div>
      <div className="mt-1 space-y-1 overflow-hidden text-xs">
        {visibleEvents.map((event) => (
          <Tooltip
            content={`${event.title} (${event.timeText})`}
            delay={300}
            key={event.id}
          >
            <div
              className={cn(
                "truncate rounded border-l-2 px-2 py-0.5",
                ...getColorStyles(event.color),
              )}
              onClick={(e) => {
                e.stopPropagation();
                onEventClick?.(event);
              }}
            >
              {event.htmlTitle ? (
                <div
                  className="truncate"
                  dangerouslySetInnerHTML={{ __html: event.htmlTitle }}
                />
              ) : (
                event.title
              )}
            </div>
          </Tooltip>
        ))}
        {hasMoreEvents && (
          <div className="text-xs text-gray-500 dark:text-gray-400">{`+${
            events.length - maxVisibleEvents
          } ${dict.more}`}</div>
        )}
      </div>
    </div>
  );
}
