import { cn } from "../../utils/cn";

describe("cn utility function", () => {
  it("should handle string arguments", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
    expect(cn("single")).toBe("single");
  });

  it("should handle number arguments", () => {
    expect(cn(1, 2, 3)).toBe("1 2 3");
    expect(cn("class", 123)).toBe("class 123");
  });

  it("should handle array arguments", () => {
    expect(cn(["class1", "class2"])).toBe("class1 class2");
    expect(cn(["class1", ["nested", "array"]])).toBe("class1 nested array");
    expect(cn(["class1", null, "class2"])).toBe("class1 class2");
  });

  it("should handle object arguments", () => {
    expect(cn({ class1: true, class2: false })).toBe("class1");
    expect(cn({ class1: true, class2: true })).toBe("class1 class2");
    expect(cn({ class1: false, class2: false })).toBeUndefined();
  });

  it("should handle mixed arguments", () => {
    expect(cn("base", { active: true, disabled: false }, ["extra"])).toBe(
      "base active extra",
    );
    expect(cn("class1", null, undefined, "class2")).toBe("class1 class2");
  });

  it("should return undefined for empty result", () => {
    expect(cn()).toBeUndefined();
    expect(cn(null, undefined, false)).toBeUndefined();
    expect(cn({ disabled: false })).toBeUndefined();
    expect(cn([])).toBeUndefined();
  });

  it("should handle falsy values", () => {
    expect(cn("", null, undefined, false, 0)).toBe("0");
    expect(cn("valid", "", null, undefined)).toBe("valid");
  });

  it("should handle nested arrays", () => {
    expect(cn([["nested", "deep"], "class"])).toBe("nested deep class");
    expect(cn([[["very", "deep"], "nesting"]])).toBe("very deep nesting");
  });

  it("should handle complex nested structures", () => {
    expect(
      cn(
        "base",
        {
          active: true,
          disabled: false,
        },
        ["array-class", { conditional: true }],
        null,
        123,
      ),
    ).toBe("base active array-class conditional 123");
  });
});
