import { formatTime, isSameDay, locales } from "./date-utils";
import { getColorStyles } from "./utils";
import { type CalendarViewProps } from "./types";
import { useMemo } from "react";
import cn from "../../../utils/cn";

export default function WeekView({
  currentDate,
  dict,
  events,
  maxDate,
  minDate,
  onDateClick,
  onEventClick,
}: CalendarViewProps) {
  // Time slots from 7:00 to 22:00 in 30-minute intervals
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 7; hour < 22; hour++) {
      slots.push({ hour, minute: 0 });
      slots.push({ hour, minute: 30 });
    }
    // Add final slot for 22:00
    slots.push({ hour: 22, minute: 0 });
    return slots;
  }, []);

  const weekDays = useMemo(() => {
    const days = [];

    const firstDayOfWeek = new Date(currentDate);
    const day = firstDayOfWeek.getDay();
    firstDayOfWeek.setDate(
      firstDayOfWeek.getDate() - (day === 0 ? 6 : day - 1),
    );

    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDayOfWeek);
      date.setDate(date.getDate() + i);

      const isDisabled =
        (minDate && date < minDate) || (maxDate && date > maxDate);

      days.push({
        date,
        disabled: isDisabled,
        events: events.filter((event) => {
          const eventDate = new Date(event.start);
          return isSameDay(eventDate, date);
        }),
        isToday: isSameDay(date, currentDate),
      });
    }

    return days;
  }, [currentDate, events, maxDate, minDate]);

  return (
    <div className="week-view overflow-auto">
      <div className="bg-surface sticky top-0 z-10 grid grid-cols-[60px_1fr]">
        <div className="border-r border-neutral-200" />
        <div className="grid grid-cols-7">
          {weekDays.map((day, index) => {
            const date = day.date.getDate();
            const month = day.date.toLocaleString(locales, { month: "short" });

            return (
              <div
                className={cn(
                  "border-r border-neutral-200 p-2 text-center",
                  day.isToday && "bg-primary-50 dark:bg-primary-900/30",
                  day.disabled
                    ? "opacity-60"
                    : "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700",
                )}
                key={index}
                onClick={() => !day.disabled && onDateClick?.(day.date)}
              >
                <div className="font-medium">
                  {dict.calendar.weekDays[index]}
                </div>
                <div
                  className={cn(
                    "inline-flex h-8 w-8 items-center justify-center rounded-full",
                    day.isToday && "bg-primary-500 text-white",
                  )}
                >
                  {date}
                </div>
                <div className="text-xs text-gray-500">{month}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-[60px_1fr]">
        <div className="time-column">
          {timeSlots.map((timeSlot, index) => (
            <div
              className="relative h-16 border-r border-b border-neutral-200 text-xs text-gray-500"
              key={index}
            >
              <span className="absolute top-1 right-2">
                {formatTime(timeSlot.hour, timeSlot.minute)}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {weekDays.map((day, dayIndex) => (
            <div className="day-column relative" key={dayIndex}>
              {timeSlots.map((_, index) => (
                <div
                  className="h-16 border-r border-b border-neutral-200"
                  key={index}
                />
              ))}

              {day.events
                .filter((event) => !event.allDay)
                .map((event) => {
                  const startHour = event.start.getHours();
                  const startMinute = event.start.getMinutes();
                  const endHour = event.end.getHours();
                  const endMinute = event.end.getMinutes();

                  // Calculate position and height based on 30-minute slots (64px per slot)
                  const startSlotIndex =
                    (startHour - 7) * 2 + Math.floor(startMinute / 30);
                  const endSlotIndex =
                    (endHour - 7) * 2 + Math.floor(endMinute / 30);

                  const top =
                    startSlotIndex * 64 + (startMinute % 30) * (64 / 30);
                  const height =
                    (endSlotIndex - startSlotIndex) * 64 +
                    ((endMinute % 30) - (startMinute % 30)) * (64 / 30);

                  return (
                    <div
                      className={cn(
                        "outline-surface absolute right-1 left-1 cursor-pointer overflow-hidden rounded-md border-l-2 px-2 py-1 text-xs leading-tight outline-[1.5px]",
                        ...getColorStyles(event.color),
                      )}
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
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
          ))}
        </div>
      </div>
    </div>
  );
}
