import { resetTableParams } from "./table-params";
import { type PageInfo } from "../../../__generated__/graphql";
import { useSearchParams } from "react-router";
import Pagination from "../pagination";
import Select from "../select";

interface TableFooterProps {
  currentPage?: number;
  first?: number;
  last?: number;
  pageInfo?: PageInfo;
  total?: number;
}

export function TableFooter({
  currentPage = 1,
  first,
  last,
  pageInfo,
  total,
}: TableFooterProps) {
  const [, setSearchParams] = useSearchParams();

  const currentFirst = last || first || 20;

  return (
    <footer className="bg-surface flex items-center justify-end gap-3 rounded-b-lg border border-t-0 border-neutral-200 p-2">
      <Select
        aria-label="Rows per page"
        defaultValue={currentFirst}
        dim="xs"
        onChange={({ target }) => {
          setSearchParams((prev) => {
            if (last) {
              prev.delete("after");
              prev.delete("before");
              prev.delete("first");
              prev.set("last", target.value);
              prev.set("page", "1");
            } else {
              resetTableParams(prev, target.value);
            }
            return prev;
          });
        }}
        options={[5, 10, 15, 20, 25, 30, 50, 100].map((value) => ({
          label: value.toString(),
          value,
        }))}
      />

      <Pagination
        currentPage={currentPage}
        first={currentFirst}
        last={last}
        onChange={(direction, cursor) => {
          setSearchParams((prev) => {
            prev.delete("after");
            prev.delete("before");
            prev.delete("first");
            prev.delete("last");

            if (direction === "next" && cursor) {
              prev.set("after", cursor);
              prev.set("first", String(currentFirst));
              prev.set("page", String(currentPage + 1));
            } else if (direction === "prev" && cursor) {
              prev.set("before", cursor);
              prev.set("last", String(currentFirst));
              prev.set("page", String(Math.max(1, currentPage - 1)));
            } else if (direction === "first") {
              prev.set("first", String(currentFirst));
              prev.set("page", "1");
            }

            return prev;
          });
        }}
        pageInfo={pageInfo}
        total={total}
      />
    </footer>
  );
}
