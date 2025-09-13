import { Button, Input } from "../";
import { formatDate, formatMonth, formatWeekRange } from "./date-utils";
import { getDictionary } from "../../../dictionaries";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type CalendarView } from "./types";
import { useMemo } from "react";

export interface CalendarHeaderProps {
  currentDate: Date;
  dict: Awaited<ReturnType<typeof getDictionary>>;
  onDateSelect?: (date: Date) => void;
  onNext: () => void;
  onPrevious: () => void;
  onViewChange: (view: CalendarView) => void;
  view: CalendarView;
  viewOptions: CalendarView[];
}

export default function CalendarHeader({
  currentDate,
  dict,
  onDateSelect,
  onNext,
  onPrevious,
  onViewChange,
  view,
  viewOptions,
}: CalendarHeaderProps) {
  const formattedDate = useMemo(() => {
    switch (view) {
      case "month":
        return formatMonth(currentDate);
      case "week":
        return formatWeekRange(currentDate);
      case "day":
        return formatDate(currentDate, "date");
      default:
        return "";
    }
  }, [currentDate, view]);

  return (
    <div className="flex items-center justify-between border-b border-neutral-200 p-2">
      <div className="flex items-center gap-2">
        <Input
          className="hidden sm:inline-flex"
          onChange={(e) => {
            const selectedDate = new Date(e.target.value);
            if (!isNaN(selectedDate.getTime())) {
              onDateSelect?.(selectedDate);
            }
          }}
          type="date"
          value={formatDate(currentDate, "input")}
        />
        <div className="flex items-center gap-1">
          <Button
            aria-label="Previous"
            onClick={onPrevious}
            size="icon"
            variant="ghost"
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            aria-label="Next"
            onClick={onNext}
            size="icon"
            variant="ghost"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
        {view !== "day" && (
          <div className="hidden items-center gap-4 lg:flex">
            <h2 className="text-lg font-semibold">{formattedDate}</h2>
          </div>
        )}
      </div>
      <div className="btn-group">
        {viewOptions.map((viewOption) => (
          <Button
            color={viewOption === view ? "default" : undefined}
            key={viewOption}
            onClick={() => onViewChange(viewOption)}
            size="sm"
            variant={viewOption === view ? undefined : "outline"}
          >
            {dict.calendar[viewOption]}
          </Button>
        ))}
      </div>
    </div>
  );
}
