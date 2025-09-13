import {
  camelToSnakeCase,
  snakeToCamelCase,
} from "../../utils/case-conversion";

describe("case-conversion utility functions", () => {
  describe("camelToSnake", () => {
    it("should convert simple camelCase to snake_case", () => {
      expect(camelToSnakeCase("camelCase")).toBe("camel_case");
      expect(camelToSnakeCase("firstName")).toBe("first_name");
      expect(camelToSnakeCase("lastName")).toBe("last_name");
    });

    it("should handle multiple capital letters", () => {
      expect(camelToSnakeCase("XMLHttpRequest")).toBe("_x_m_l_http_request");
      expect(camelToSnakeCase("HTMLElement")).toBe("_h_t_m_l_element");
      expect(camelToSnakeCase("JSONData")).toBe("_j_s_o_n_data");
    });

    it("should handle single word (no uppercase)", () => {
      expect(camelToSnakeCase("word")).toBe("word");
      expect(camelToSnakeCase("simple")).toBe("simple");
    });

    it("should handle single uppercase letter", () => {
      expect(camelToSnakeCase("A")).toBe("_a");
      expect(camelToSnakeCase("myA")).toBe("my_a");
    });

    it("should handle empty string", () => {
      expect(camelToSnakeCase("")).toBe("");
    });

    it("should handle strings starting with uppercase", () => {
      expect(camelToSnakeCase("CamelCase")).toBe("_camel_case");
      expect(camelToSnakeCase("PascalCase")).toBe("_pascal_case");
    });

    it("should handle complex camelCase strings", () => {
      expect(camelToSnakeCase("getUserById")).toBe("get_user_by_id");
      expect(camelToSnakeCase("createNewUserAccount")).toBe(
        "create_new_user_account",
      );
      expect(camelToSnakeCase("isValidEmailAddress")).toBe(
        "is_valid_email_address",
      );
    });
  });

  describe("snakeToCamel", () => {
    it("should convert simple snake_case to camelCase", () => {
      expect(snakeToCamelCase("snake_case")).toBe("snakeCase");
      expect(snakeToCamelCase("first_name")).toBe("firstName");
      expect(snakeToCamelCase("last_name")).toBe("lastName");
    });

    it("should handle multiple underscores", () => {
      expect(snakeToCamelCase("user_first_name")).toBe("userFirstName");
      expect(snakeToCamelCase("get_user_by_id")).toBe("getUserById");
      expect(snakeToCamelCase("create_new_user_account")).toBe(
        "createNewUserAccount",
      );
    });

    it("should handle single word (no underscores)", () => {
      expect(snakeToCamelCase("word")).toBe("word");
      expect(snakeToCamelCase("simple")).toBe("simple");
    });

    it("should handle single underscore", () => {
      expect(snakeToCamelCase("my_a")).toBe("myA");
      expect(snakeToCamelCase("a_b")).toBe("aB");
    });

    it("should handle empty string", () => {
      expect(snakeToCamelCase("")).toBe("");
    });

    it("should handle strings ending with underscore", () => {
      expect(snakeToCamelCase("test_")).toBe("test_");
      expect(snakeToCamelCase("user_name_")).toBe("userName_");
    });

    it("should handle strings starting with underscore", () => {
      expect(snakeToCamelCase("_test")).toBe("Test");
      expect(snakeToCamelCase("_user_name")).toBe("UserName");
    });

    it("should handle consecutive underscores", () => {
      expect(snakeToCamelCase("test__double")).toBe("test_Double");
      expect(snakeToCamelCase("user___name")).toBe("user__Name");
    });
  });

  describe("round-trip conversion", () => {
    it("should maintain consistency for simple cases", () => {
      const original = "firstName";
      const snake = camelToSnakeCase(original);
      const backToCamel = snakeToCamelCase(snake);
      expect(backToCamel).toBe(original);
    });

    it("should handle round-trip for valid camelCase (starting with lowercase)", () => {
      const testCases = [
        "getUserById",
        "createNewAccount",
        "isValidEmail",
        "firstName",
        "lastName",
      ];

      testCases.forEach((original) => {
        const snake = camelToSnakeCase(original);
        const backToCamel = snakeToCamelCase(snake);
        expect(backToCamel).toBe(original);
      });
    });

    it("should show different behavior for PascalCase", () => {
      const original = "PascalCase";
      const snake = camelToSnakeCase(original);
      const backToCamel = snakeToCamelCase(snake);
      expect(backToCamel).toBe("PascalCase");
      expect(snake).toBe("_pascal_case");
    });
  });
});
