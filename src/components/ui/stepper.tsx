import { cn } from "../../utils/cn";
import { Fragment } from "react";
import { type LucideIcon } from "lucide-react";

export interface StepperStep {
  id: string | number;
  hasError?: boolean;
  icon: LucideIcon;
  isClickable?: boolean;
  isCompleted?: boolean;
  title: string;
}

export interface StepperProps {
  className?: string;
  currentStepId: string | number;
  onStepClick?: (stepId: string | number) => void;
  steps: StepperStep[];
}

export default function Stepper({
  className,
  currentStepId,
  onStepClick,
  steps,
}: StepperProps) {
  const currentStepIndex = steps.findIndex((step) => step.id === currentStepId);
  const currentStepNumber = currentStepIndex + 1;

  const handleStepClick = (stepId: string | number) => {
    const step = steps.find((s) => s.id === stepId);
    if (step?.isClickable !== false && onStepClick) {
      onStepClick(stepId);
    }
  };

  return (
    <div className={cn("mb-6", className)}>
      {/* Step icons */}
      <div className="mb-4 flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = step.id === currentStepId;
          const isCompleted =
            step.isCompleted ?? stepNumber < currentStepNumber;
          const hasError = step.hasError ?? false;
          const isClickable = step.isClickable ?? true;
          const IconComponent = step.icon;
          const isLast = index === steps.length - 1;

          return (
            <Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <button
                  className={cn(
                    "relative flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300",
                    {
                      "border-primary-500 bg-primary-500 scale-110 text-white shadow-lg":
                        isActive && !hasError,
                      "border-danger-500 bg-danger-500 scale-110 text-white shadow-lg":
                        isActive && hasError,
                      "border-primary-500 bg-primary-500 text-white":
                        isCompleted && !isActive && !hasError,
                      "border-danger-500 bg-danger-500 text-white":
                        hasError && !isActive,
                      "border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-800":
                        !isActive && !isCompleted && !hasError,
                      "cursor-pointer hover:scale-105": isClickable,
                      "cursor-not-allowed": !isClickable,
                    },
                  )}
                  disabled={!isClickable}
                  onClick={() => handleStepClick(step.id)}
                  title={step.title}
                  type="button"
                >
                  <IconComponent className="h-5 w-5" />
                  {isActive && (
                    <div
                      className={cn(
                        "absolute inset-0 animate-pulse rounded-full border-2",
                        {
                          "border-primary-200": !hasError,
                          "border-danger-200": hasError,
                        },
                      )}
                    />
                  )}
                </button>
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div className="mx-4 flex-1">
                  <div
                    className={cn(
                      "h-0.5 w-full border-t-2 border-dashed opacity-80 transition-all duration-300",
                      {
                        "border-primary-500": isCompleted && !hasError,
                        "border-danger-500": hasError,
                        "border-gray-300 dark:border-gray-700":
                          !isCompleted && !hasError,
                      },
                    )}
                  />
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
