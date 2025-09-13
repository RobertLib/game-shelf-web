import { Fragment } from "react/jsx-runtime";
import cn from "../../utils/cn";

interface Item {
  term: string;
  desc: React.ReactNode;
}

interface DescriptionListProps extends React.ComponentProps<"dl"> {
  items: Item[];
  loading?: boolean;
  termWidth?: string;
}

const placeholderWidths = ["w-34", "w-30", "w-26", "w-38", "w-42", "w-46"];

const getPlaceholderWidth = (index: number): string =>
  placeholderWidths[index % placeholderWidths.length];

export default function DescriptionList({
  className,
  items,
  loading = false,
  style,
  termWidth,
  ...props
}: DescriptionListProps) {
  return (
    <dl
      {...props}
      className={cn(
        "space-y-1 md:grid md:items-baseline md:space-y-0 md:gap-x-4 md:gap-y-2",
        termWidth
          ? "md:[grid-template-columns:var(--term-width)_1fr]"
          : "md:grid-cols-[auto_1fr]",
        className,
      )}
      style={
        termWidth
          ? ({
              ...style,
              "--term-width": termWidth,
            } as React.CSSProperties)
          : style
      }
    >
      {items.map((item, index) => (
        <Fragment key={index}>
          <dt className="text-sm font-semibold">{item.term}:</dt>
          <dd className="pb-1.5 text-gray-500 md:pb-0 dark:text-gray-400">
            {loading ? (
              <div
                className={`h-4 ${getPlaceholderWidth(index)} animate-pulse rounded bg-gray-200 dark:bg-gray-700`}
              />
            ) : (
              item.desc
            )}
          </dd>
        </Fragment>
      ))}
    </dl>
  );
}
