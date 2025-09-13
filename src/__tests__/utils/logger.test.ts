import logger from "../../utils/logger";

const originalConsole = { ...console };
const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
  trace: vi.fn(),
  time: vi.fn(),
  timeEnd: vi.fn(),
  group: vi.fn(),
  groupEnd: vi.fn(),
  clear: vi.fn(),
  count: vi.fn(),
  countReset: vi.fn(),
  table: vi.fn(),
  dir: vi.fn(),
  dirxml: vi.fn(),
  assert: vi.fn(),
  profile: vi.fn(),
  profileEnd: vi.fn(),
  timeLog: vi.fn(),
  groupCollapsed: vi.fn(),
};

describe("logger", () => {
  const originalWindow = global.window;

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(console, mockConsole);
  });

  afterEach(() => {
    Object.assign(console, originalConsole);
    if (originalWindow) {
      global.window = originalWindow;
    } else {
      delete (global as Partial<typeof global>).window;
    }
  });

  describe("in development environment", () => {
    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "development");
    });

    it("should call console.log in development", () => {
      logger.log("test message");
      expect(mockConsole.log).toHaveBeenCalledWith("test message");
    });

    it("should call console.error in development", () => {
      logger.error("error message", { error: "details" });
      expect(mockConsole.error).toHaveBeenCalledWith("error message", {
        error: "details",
      });
    });

    it("should call console.warn in development", () => {
      logger.warn("warning message");
      expect(mockConsole.warn).toHaveBeenCalledWith("warning message");
    });

    it("should call console.info in development", () => {
      logger.info("info message");
      expect(mockConsole.info).toHaveBeenCalledWith("info message");
    });

    it("should call console.debug in development", () => {
      logger.debug("debug message");
      expect(mockConsole.debug).toHaveBeenCalledWith("debug message");
    });

    it("should call console.trace in development", () => {
      logger.trace("trace message");
      expect(mockConsole.trace).toHaveBeenCalledWith("trace message");
    });

    it("should call console.time in development", () => {
      logger.time("timer");
      expect(mockConsole.time).toHaveBeenCalledWith("timer");
    });

    it("should call console.timeEnd in development", () => {
      logger.timeEnd("timer");
      expect(mockConsole.timeEnd).toHaveBeenCalledWith("timer");
    });

    it("should call console.group in development", () => {
      logger.group("group");
      expect(mockConsole.group).toHaveBeenCalledWith("group");
    });

    it("should call console.table in development", () => {
      const data = [{ name: "test", value: 1 }];
      logger.table(data);
      expect(mockConsole.table).toHaveBeenCalledWith(data);
    });

    it("should handle multiple arguments", () => {
      logger.log("message", { data: "test" }, 123, true);
      expect(mockConsole.log).toHaveBeenCalledWith(
        "message",
        { data: "test" },
        123,
        true,
      );
    });
  });

  describe("in production environment", () => {
    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "production");
      global.window = {} as typeof global.window;
    });

    it("should not call console.log in production browser", () => {
      logger.log("test message");
      expect(mockConsole.log).not.toHaveBeenCalled();
    });

    it("should not call console.error in production browser", () => {
      logger.error("error message");
      expect(mockConsole.error).not.toHaveBeenCalled();
    });

    it("should not call console.warn in production browser", () => {
      logger.warn("warning message");
      expect(mockConsole.warn).not.toHaveBeenCalled();
    });

    it("should not call console.info in production browser", () => {
      logger.info("info message");
      expect(mockConsole.info).not.toHaveBeenCalled();
    });

    it("should not call any console method in production browser", () => {
      logger.debug("debug");
      logger.trace("trace");
      logger.time("timer");
      logger.group("group");
      logger.table([]);

      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.trace).not.toHaveBeenCalled();
      expect(mockConsole.time).not.toHaveBeenCalled();
      expect(mockConsole.group).not.toHaveBeenCalled();
      expect(mockConsole.table).not.toHaveBeenCalled();
    });
  });

  describe("in server environment (no window)", () => {
    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "production");
      delete (global as Partial<typeof global>).window;
    });

    it("should call console.log in server environment regardless of NODE_ENV", () => {
      logger.log("server message");
      expect(mockConsole.log).toHaveBeenCalledWith("server message");
    });

    it("should call console.error in server environment", () => {
      logger.error("server error");
      expect(mockConsole.error).toHaveBeenCalledWith("server error");
    });

    it("should call all console methods in server environment", () => {
      logger.warn("warn");
      logger.info("info");
      logger.debug("debug");

      expect(mockConsole.warn).toHaveBeenCalledWith("warn");
      expect(mockConsole.info).toHaveBeenCalledWith("info");
      expect(mockConsole.debug).toHaveBeenCalledWith("debug");
    });
  });

  describe("logger interface", () => {
    it("should have common console methods available", () => {
      const commonMethods = [
        "log",
        "error",
        "warn",
        "info",
        "debug",
        "trace",
        "time",
        "timeEnd",
        "group",
        "groupEnd",
        "clear",
        "count",
        "table",
      ];

      commonMethods.forEach((method) => {
        expect(logger).toHaveProperty(method);
        expect(typeof logger[method as keyof typeof logger]).toBe("function");
      });
    });

    it("should maintain function signatures", () => {
      expect(() => {
        logger.log();
        logger.error();
        logger.warn();
        logger.info();
        logger.debug();
        logger.trace();
        logger.time();
        logger.timeEnd();
        logger.group();
        logger.groupEnd();
        logger.clear();
        logger.count();
        logger.table();
      }).not.toThrow();
    });
  });

  describe("edge cases", () => {
    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "development");
    });

    it("should handle undefined arguments", () => {
      logger.log(undefined);
      expect(mockConsole.log).toHaveBeenCalledWith(undefined);
    });

    it("should handle null arguments", () => {
      logger.error(null);
      expect(mockConsole.error).toHaveBeenCalledWith(null);
    });

    it("should handle empty arguments", () => {
      logger.warn();
      expect(mockConsole.warn).toHaveBeenCalledWith();
    });

    it("should handle complex objects", () => {
      const complexObj = {
        nested: { deep: { value: "test" } },
        array: [1, 2, { inner: true }],
        fn: () => "test",
        symbol: Symbol("test"),
      };

      logger.info(complexObj);
      expect(mockConsole.info).toHaveBeenCalledWith(complexObj);
    });

    it("should handle circular references gracefully", () => {
      const circular: Record<string, unknown> = { name: "circular" };
      circular.self = circular;

      expect(() => {
        logger.log(circular);
      }).not.toThrow();

      expect(mockConsole.log).toHaveBeenCalledWith(circular);
    });
  });

  describe("environment variable edge cases", () => {
    it("should work when NODE_ENV is undefined", () => {
      vi.stubEnv("NODE_ENV", undefined);
      delete (global as Partial<typeof global>).window;

      logger.log("test");
      expect(mockConsole.log).toHaveBeenCalledWith("test");
    });

    it("should work with different NODE_ENV values", () => {
      const envValues = ["test", "staging", "production", "development"];

      envValues.forEach((env) => {
        vi.clearAllMocks();
        vi.stubEnv("NODE_ENV", env);
        delete (global as Partial<typeof global>).window;

        logger.log(`test in ${env}`);
        expect(mockConsole.log).toHaveBeenCalledWith(`test in ${env}`);
      });
    });
  });
});
