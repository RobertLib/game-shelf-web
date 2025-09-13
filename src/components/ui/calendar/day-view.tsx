import { formatDate, formatTime, isSameDay } from "./date-utils";
import { getColorStyles } from "./utils";
import { type CalendarViewProps } from "./types";
import { useMemo } from "react";
import cn from "../../../utils/cn";

export default function DayView({
  currentDate,
  dict,
  events,
  maxDate,
  minDate,
  onEventClick,
}: CalendarViewProps) {
  const hours = Array.from({ length: 16 }, (_, i) => i + 7); // Hours from 7 to 22

  const isDisabled =
    (minDate && currentDate < minDate) || (maxDate && currentDate > maxDate);

  const dayEvents = useMemo(
    () =>
      events.filter((event) => {
        const eventDate = new Date(event.start);
        return isSameDay(eventDate, currentDate);
      }),
    [currentDate, events],
  );

  const allDayEvents = dayEvents.filter((event) => event.allDay);
  const timedEvents = dayEvents.filter((event) => !event.allDay);

  const formattedDate = formatDate(currentDate, "date");

  return (
    <div className="day-view overflow-auto">
      {allDayEvents.length > 0 && (
        <div className="bg-surface sticky top-0 z-10 flex items-center border-b border-neutral-200 p-2">
          <div
            className={cn(
              "bg-primary-50 dark:bg-primary-900/30 p-2 text-center",
              isDisabled && "opacity-60",
            )}
          >
            <div className="font-medium">{formattedDate}</div>
            <div className="mt-2 space-y-1">
              {allDayEvents.map((event) => (
                <div
                  className={cn(
                    "cursor-pointer rounded border-l-2 px-2 py-1 text-sm",
                    ...getColorStyles(event.color),
                  )}
                  key={event.id}
                  onClick={() => onEventClick?.(event)}
                >
                  {event.htmlTitle ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: event.htmlTitle }}
                    />
                  ) : (
                    `${event.title} (${dict.calendar.allDay})`
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-[60px_1fr]">
        <div className="time-column">
          {hours.map((hour) => (
            <div
              className="relative h-32 border-r border-b border-neutral-200 text-xs text-gray-500"
              key={hour}
            >
              <span className="absolute top-1 right-2">{formatTime(hour)}</span>
            </div>
          ))}
        </div>

        <div className="relative">
          {hours.map((hour) => (
            <div
              className="h-32 border-r border-b border-neutral-200"
              key={hour}
            />
          ))}

          {timedEvents
            .filter((event) => {
              const startHour = event.start.getHours();
              const endHour = event.end.getHours();
              // Only show events that are within or overlap with 7-22 hour range
              return endHour > 7 && startHour < 22;
            })
            .map((event) => {
              const startHour = event.start.getHours();
              const startMinute = event.start.getMinutes();
              const endHour = event.end.getHours();
              const endMinute = event.end.getMinutes();

              const top = (startHour - 7) * 128 + (startMinute / 60) * 128;
              const height =
                (endHour - startHour) * 128 +
                ((endMinute - startMinute) / 60) * 128;

              return (
                <div
                  className={cn(
                    "absolute right-1 left-1 cursor-pointer overflow-hidden rounded-md border-l-2 px-2 py-1 text-xs leading-tight",
                    ...getColorStyles(event.color),
                  )}
                  key={event.id}
                  onClick={() => onEventClick?.(event)}
                  style={{ height: `${height}px`, top: `${top}px` }}
                  title={event.title}
                >
                  {event.htmlTitle ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: event.htmlTitle }}
                    />
                  ) : (
                    <div className="font-medium">{event.title}</div>
                  )}
                  <div className="text-xs opacity-80">
                    {`${formatTime(startHour, startMinute)} - ${formatTime(endHour, endMinute)}`}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
