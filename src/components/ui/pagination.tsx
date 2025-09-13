import { ChevronLeft, ChevronRight, ChevronsLeft } from "lucide-react";
import { type PageInfo } from "../../__generated__/graphql";
import Button from "./button";
import cn from "../../utils/cn";

interface PaginationProps extends Omit<React.ComponentProps<"ul">, "onChange"> {
  currentPage?: number;
  first?: number;
  last?: number;
  onChange: (direction: "first" | "prev" | "next", cursor?: string) => void;
  pageInfo?: PageInfo;
  total?: number;
}

export default function Pagination({
  className,
  currentPage = 1,
  first,
  last,
  onChange,
  pageInfo,
  total,
  ...props
}: PaginationProps) {
  const hasNextPage = pageInfo?.hasNextPage ?? false;
  const hasPreviousPage = pageInfo?.hasPreviousPage ?? false;
  const pageSize = first || last || 20;

  return (
    <nav aria-label="Pagination">
      <ul {...props} className={cn("flex items-center gap-1.5", className)}>
        <li className="mr-1.25 flex items-center text-sm">
          <span aria-live="polite">
            {typeof total === "undefined"
              ? "1 - 1 / 1"
              : total === 0
                ? "0 - 0 / 0"
                : `${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, total)} / ${total}`}
          </span>
        </li>
        <li className="flex items-center">
          <Button
            aria-label="Go to first page"
            color="default"
            disabled={!hasPreviousPage}
            onClick={() => onChange("first")}
            size="sm"
          >
            <ChevronsLeft size={18} />
          </Button>
        </li>
        <li className="flex items-center">
          <Button
            aria-label="Go to previous page"
            color="default"
            disabled={!hasPreviousPage}
            onClick={() => onChange("prev", pageInfo?.startCursor || undefined)}
            size="sm"
          >
            <ChevronLeft size={18} />
          </Button>
        </li>
        <li className="flex items-center">
          <Button
            aria-label="Go to next page"
            color="default"
            disabled={!hasNextPage}
            onClick={() => onChange("next", pageInfo?.endCursor || undefined)}
            size="sm"
          >
            <ChevronRight size={18} />
          </Button>
        </li>
      </ul>
    </nav>
  );
}
