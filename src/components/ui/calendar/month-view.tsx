import { isSameDay } from "./date-utils";
import { type CalendarViewProps } from "./types";
import { useMemo } from "react";
import DateCell from "./date-cell";

export default function MonthView({
  currentDate,
  dict,
  events,
  maxDate,
  minDate,
  onDateClick,
  onEventClick,
}: CalendarViewProps) {
  const weeks = useMemo(() => {
    const result = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);

    const startDate = new Date(firstDay);
    const dayOfWeek = startDate.getDay() || 7;
    startDate.setDate(startDate.getDate() - (dayOfWeek - 1));

    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        const iterationDate = new Date(startDate);

        const isCurrentMonth =
          iterationDate.getMonth() === month &&
          iterationDate.getFullYear() === year;

        const isDisabled =
          (minDate && iterationDate < minDate) ||
          (maxDate && iterationDate > maxDate);

        const dayEvents = (events || []).filter(
          (event) =>
            isSameDay(event.start, iterationDate) ||
            (event.allDay &&
              event.start <= iterationDate &&
              event.end >= iterationDate),
        );

        week.push({
          date: new Date(iterationDate),
          disabled: isDisabled,
          events: dayEvents,
          isCurrentMonth,
          isToday: isSameDay(iterationDate, currentDate), // Check if this iteration's date matches the selected date
        });

        startDate.setDate(startDate.getDate() + 1);
      }
      result.push(week);
    }

    return result;
  }, [currentDate, events, maxDate, minDate]);

  return (
    <div className="h-full">
      <div className="grid grid-cols-7 border-b border-neutral-200">
        {dict.calendar.weekDays.map((day, index) => (
          <div
            className="p-2 text-center font-medium text-gray-500 dark:text-gray-400"
            key={index}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid h-full grid-rows-6">
        {weeks.map((week, i) => (
          <div className="grid grid-cols-7 border-b border-neutral-200" key={i}>
            {week.map((day, j) => (
              <DateCell
                date={day.date}
                dict={dict}
                disabled={day.disabled}
                events={day.events}
                isCurrentMonth={day.isCurrentMonth}
                isToday={day.isToday}
                key={`${i}-${j}`}
                onDateClick={onDateClick}
                onEventClick={onEventClick}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
