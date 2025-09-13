import { cache } from "react";
import logger from "../../../utils/logger";

export function computeTableParams(searchParams: URLSearchParams) {
  const after = searchParams.get("after");
  const before = searchParams.get("before");
  const firstStr = searchParams.get("first");
  const lastStr = searchParams.get("last");

  const hasLast = lastStr !== null;

  const first = hasLast ? undefined : firstStr ? parseInt(firstStr, 10) : 20;
  const validFirst =
    first !== undefined ? (isNaN(first) || first < 1 ? 20 : first) : undefined;

  const last = hasLast ? parseInt(lastStr, 10) : undefined;
  const validLast =
    last !== undefined ? (isNaN(last) || last < 1 ? 20 : last) : undefined;

  const pageStr = searchParams.get("page");
  const page = pageStr ? parseInt(pageStr, 10) : 1;
  const validPage = isNaN(page) || page < 1 ? 1 : page;

  const sortBy = searchParams.get("sortBy");
  const orderParam = searchParams.get("order");
  const order =
    orderParam === "ASC" || orderParam === "DESC" ? orderParam : "DESC";

  const search = searchParams.get("search") || "";

  let filters = {} as Record<string, string>;
  try {
    const filtersStr = searchParams.get("filters");
    if (filtersStr && filtersStr.trim() !== "") {
      filters = JSON.parse(filtersStr);
    }
  } catch (error) {
    logger.error("Error parsing filters from URL params:", error);
  }

  const showDeleted = searchParams.get("showDeleted") === "true";

  return {
    after,
    before,
    first: validFirst,
    last: validLast,
    page: validPage,
    sortBy,
    order,
    search,
    filters,
    showDeleted,
  };
}

export const getTableParams = cache(computeTableParams);

export function resetTableParams(
  searchParams: URLSearchParams,
  firstValue?: string,
) {
  searchParams.delete("after");
  searchParams.delete("before");
  searchParams.delete("last");
  searchParams.set("first", firstValue || searchParams.get("first") || "20");
  searchParams.set("page", "1");
}
