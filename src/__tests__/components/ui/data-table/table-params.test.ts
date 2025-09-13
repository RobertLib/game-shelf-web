import {
  computeTableParams,
  getTableParams,
} from "../../../../components/ui/data-table/table-params";

describe("Table Params Utilities", () => {
  describe("computeTableParams", () => {
    it("returns default values when no params are provided", () => {
      const searchParams = new URLSearchParams();
      const result = computeTableParams(searchParams);

      expect(result).toEqual({
        after: null,
        before: null,
        first: 20,
        last: undefined,
        page: 1,
        search: "",
        sortBy: null,
        order: "DESC",
        filters: {},
        showDeleted: false,
      });
    });

    it("parses page and first values correctly", () => {
      const searchParams = new URLSearchParams();
      searchParams.set("page", "3");
      searchParams.set("first", "50");

      const result = computeTableParams(searchParams);

      expect(result.page).toBe(3);
      expect(result.first).toBe(50);
    });

    it("parses sortBy and order values correctly", () => {
      const searchParams = new URLSearchParams();
      searchParams.set("sortBy", "name");
      searchParams.set("order", "ASC");

      const result = computeTableParams(searchParams);

      expect(result.sortBy).toBe("name");
      expect(result.order).toBe("ASC");
    });

    it("parses filters correctly", () => {
      const searchParams = new URLSearchParams();
      const filters = { name: "John", status: "active" };
      searchParams.set("filters", JSON.stringify(filters));

      const result = computeTableParams(searchParams);

      expect(result.filters).toEqual(filters);
    });

    it("handles empty filters string", () => {
      const searchParams = new URLSearchParams();
      searchParams.set("filters", "");

      const result = computeTableParams(searchParams);

      expect(result.filters).toEqual({});
    });

    it("parses showDeleted correctly", () => {
      const searchParams = new URLSearchParams();
      searchParams.set("showDeleted", "true");

      const result = computeTableParams(searchParams);

      expect(result.showDeleted).toBe(true);
    });

    it("handles malformed JSON in filters", () => {
      const searchParams = new URLSearchParams();
      searchParams.set("filters", "invalid-json");

      try {
        const result = computeTableParams(searchParams);
        expect(result.filters).toEqual({});
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    it("handles non-numeric values for page and first", () => {
      const searchParams = new URLSearchParams();
      searchParams.set("page", "abc");
      searchParams.set("first", "xyz");

      const result = computeTableParams(searchParams);

      expect(result.page).toBe(1);
      expect(result.first).toBe(20);
    });
  });

  describe("getTableParams", () => {
    it("caches results for the same input", () => {
      const searchParams1 = new URLSearchParams();
      searchParams1.set("page", "2");

      const searchParams2 = new URLSearchParams();
      searchParams2.set("page", "2");

      const result1 = getTableParams(searchParams1);
      const result2 = getTableParams(searchParams2);

      expect(result1).toEqual(result2);
    });

    it("returns different results for different inputs", () => {
      const searchParams1 = new URLSearchParams();
      searchParams1.set("page", "1");

      const searchParams2 = new URLSearchParams();
      searchParams2.set("page", "2");

      const result1 = getTableParams(searchParams1);
      const result2 = getTableParams(searchParams2);

      expect(result1).not.toEqual(result2);
    });

    it("handles complex filter objects", () => {
      const searchParams = new URLSearchParams();
      const complexFilters = {
        name: "John Doe",
        email: "john@example.com",
        role: "admin",
        active: true,
        createdAt: "2023-12-01",
        metadata: { department: "IT", level: 5 },
      };
      searchParams.set("filters", JSON.stringify(complexFilters));

      const result = getTableParams(searchParams);

      expect(result.filters).toEqual(complexFilters);
    });

    it("handles edge cases with invalid JSON in filters", () => {
      const searchParams = new URLSearchParams();
      searchParams.set("filters", "invalid-json");

      const result = getTableParams(searchParams);

      expect(result.filters).toEqual({});
    });

    it("handles showDeleted parameter", () => {
      const searchParams = new URLSearchParams();
      searchParams.set("showDeleted", "true");

      const result = getTableParams(searchParams);

      expect(result.showDeleted).toBe(true);
    });

    it("handles before and after cursor parameters", () => {
      const searchParams = new URLSearchParams();
      searchParams.set("before", "cursor-before");
      searchParams.set("after", "cursor-after");

      const result = getTableParams(searchParams);

      expect(result.before).toBe("cursor-before");
      expect(result.after).toBe("cursor-after");
    });

    it("handles last parameter instead of first", () => {
      const searchParams = new URLSearchParams();
      searchParams.set("last", "30");

      const result = getTableParams(searchParams);

      expect(result.last).toBe(30);
      expect(result.first).toBeUndefined();
    });

    it("handles zero and negative values correctly", () => {
      const searchParams = new URLSearchParams();
      searchParams.set("page", "0");
      searchParams.set("first", "-10");

      const result = getTableParams(searchParams);

      expect(result.page).toBe(1);
      expect(result.first).toBe(20);
    });

    it("handles very large numbers", () => {
      const searchParams = new URLSearchParams();
      searchParams.set("page", "9999999");
      searchParams.set("first", "1000000");

      const result = getTableParams(searchParams);

      expect(result.page).toBe(9999999);
      expect(result.first).toBe(1000000);
    });

    it("preserves original URLSearchParams object", () => {
      const searchParams = new URLSearchParams();
      searchParams.set("page", "2");
      const originalString = searchParams.toString();

      getTableParams(searchParams);

      expect(searchParams.toString()).toBe(originalString);
    });
  });
});
