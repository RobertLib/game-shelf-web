import { useId, useRef, useState } from "react";
import cn from "../../utils/cn";

interface TooltipProps extends React.ComponentProps<"div"> {
  delay?: number;
  position?: "top" | "bottom" | "left" | "right";
  title?: string;
}

export default function Tooltip({
  className,
  delay = 1000,
  children,
  onClick,
  position = "right",
  title,
  ...props
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timer = useRef<NodeJS.Timeout>(null);
  const tooltipId = useId();

  const showTooltip = () => {
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timer.current) clearTimeout(timer.current);

    setIsVisible(false);
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    hideTooltip();
    onClick?.(event);
  };

  const positionStyles = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      {...props}
      className={cn("relative inline-flex", className)}
      onClick={handleClick}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      <span
        aria-describedby={isVisible ? tooltipId : undefined}
        className="flex"
      >
        {children}
      </span>

      {isVisible && (
        <div
          aria-hidden={!isVisible}
          className={cn(
            "animate-fade-in absolute z-10 rounded bg-gray-900 px-2 py-1 text-sm font-medium text-white shadow-sm",
            positionStyles[position],
          )}
          id={tooltipId}
          role="tooltip"
        >
          {title}
          <div
            className={cn(
              "absolute h-2 w-2 rotate-45 bg-gray-900",
              position === "top" && "bottom-[-4px] left-1/2 -translate-x-1/2",
              position === "bottom" && "top-[-4px] left-1/2 -translate-x-1/2",
              position === "left" && "top-1/2 right-[-4px] -translate-y-1/2",
              position === "right" && "top-1/2 left-[-4px] -translate-y-1/2",
            )}
          />
        </div>
      )}
    </div>
  );
}
