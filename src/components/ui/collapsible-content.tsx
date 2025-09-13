import { cn } from "../../utils/cn";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

interface CollapsibleContentProps {
  className?: string;
  duration?: number;
  children: ReactNode;
  isOpen: boolean;
}

export default function CollapsibleContent({
  className,
  duration = 300,
  children,
  isOpen,
}: CollapsibleContentProps) {
  const [isVisible, setIsVisible] = useState(isOpen);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    const element = contentRef.current;

    if (isOpen) {
      // If opening, first set visibility synchronously
      flushSync(() => {
        setIsVisible(true);
      });

      // Measure actual content height
      const scrollHeight = element.scrollHeight;

      // Set height from 0 to actual height
      element.style.height = "0px";
      setTimeout(() => {
        element.style.height = `${scrollHeight}px`;
      }, 10);

      // After animation completes, remove fixed height
      const timer = setTimeout(() => {
        element.style.height = "auto";
      }, duration);

      return () => clearTimeout(timer);
    } else {
      // If closing, first set fixed height
      // Use current height (either auto or already set px value)
      const currentHeight =
        element.style.height === "auto" || element.style.height === ""
          ? element.scrollHeight
          : parseInt(element.style.height);

      element.style.height = `${currentHeight}px`;

      // Then animate to 0
      setTimeout(() => {
        element.style.height = "0px";
      });

      // After animation completes, hide element
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, isOpen]);

  if (!isVisible && !isOpen) {
    return null;
  }

  return (
    <div
      className={cn("overflow-hidden transition-all ease-in-out", className)}
      ref={contentRef}
      style={{
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}
