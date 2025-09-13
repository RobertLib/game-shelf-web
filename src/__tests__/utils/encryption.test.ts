import EncryptionService from "../../utils/encryption";
import logger from "../../utils/logger";

vi.mock("../../utils/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

const mockCrypto = {
  subtle: {
    importKey: vi.fn(),
    deriveKey: vi.fn(),
    encrypt: vi.fn(),
    decrypt: vi.fn(),
  },
  getRandomValues: vi.fn(),
};

Object.defineProperty(globalThis, "crypto", {
  value: mockCrypto,
  writable: true,
});

global.TextEncoder = vi.fn(() => ({
  encode: vi.fn((text: string) => new Uint8Array(Buffer.from(text, "utf8"))),
})) as unknown as typeof TextEncoder;

global.TextDecoder = vi.fn(() => ({
  decode: vi.fn((buffer: Uint8Array) => Buffer.from(buffer).toString("utf8")),
})) as unknown as typeof TextDecoder;

global.btoa = vi.fn((str: string) =>
  Buffer.from(str, "binary").toString("base64"),
);
global.atob = vi.fn((str: string) =>
  Buffer.from(str, "base64").toString("binary"),
);

describe("EncryptionService", () => {
  const mockKey = {} as CryptoKey;
  const mockKeyMaterial = {} as CryptoKey;
  const testData = "test data to encrypt";
  const mockIv = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  const mockEncrypted = new Uint8Array([13, 14, 15, 16]);

  beforeEach(() => {
    vi.clearAllMocks();

    (EncryptionService as unknown as { key: unknown }).key = null;

    mockCrypto.subtle.importKey.mockResolvedValue(mockKeyMaterial);
    mockCrypto.subtle.deriveKey.mockResolvedValue(mockKey);
    mockCrypto.getRandomValues.mockReturnValue(mockIv);
    mockCrypto.subtle.encrypt.mockResolvedValue(mockEncrypted.buffer);
    mockCrypto.subtle.decrypt.mockResolvedValue(
      new TextEncoder().encode(testData).buffer,
    );
  });

  describe("encrypt", () => {
    it("should encrypt data successfully", async () => {
      const result = await EncryptionService.encrypt(testData);

      expect(mockCrypto.subtle.importKey).toHaveBeenCalledWith(
        "raw",
        expect.any(Uint8Array),
        { name: "PBKDF2" },
        false,
        ["deriveKey"],
      );

      expect(mockCrypto.subtle.deriveKey).toHaveBeenCalledWith(
        {
          name: "PBKDF2",
          salt: expect.any(Uint8Array),
          iterations: 100000,
          hash: "SHA-256",
        },
        mockKeyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"],
      );

      expect(mockCrypto.getRandomValues).toHaveBeenCalledWith(
        expect.any(Uint8Array),
      );
      expect(mockCrypto.subtle.encrypt).toHaveBeenCalledWith(
        { name: "AES-GCM", iv: mockIv },
        mockKey,
        expect.any(Uint8Array),
      );

      expect(typeof result).toBe("string");
      expect(global.btoa).toHaveBeenCalled();
    });

    it("should reuse existing key on subsequent calls", async () => {
      await EncryptionService.encrypt(testData);
      await EncryptionService.encrypt("another test");

      expect(mockCrypto.subtle.importKey).toHaveBeenCalledTimes(1);
      expect(mockCrypto.subtle.deriveKey).toHaveBeenCalledTimes(1);
    });

    it("should use default encryption key when environment variable is not set", async () => {
      const originalEnv = import.meta.env.VITE_ENCRYPTION_KEY;
      delete import.meta.env.VITE_ENCRYPTION_KEY;

      await EncryptionService.encrypt(testData);

      expect(mockCrypto.subtle.importKey).toHaveBeenCalledWith(
        "raw",
        new TextEncoder().encode("default-key-32-chars-long-123456"),
        { name: "PBKDF2" },
        false,
        ["deriveKey"],
      );

      if (originalEnv) {
        import.meta.env.VITE_ENCRYPTION_KEY = originalEnv;
      }
    });

    it("should use custom encryption key from environment", async () => {
      const customKey = "my-custom-encryption-key-32-chars";
      import.meta.env.VITE_ENCRYPTION_KEY = customKey;

      await EncryptionService.encrypt(testData);

      expect(mockCrypto.subtle.importKey).toHaveBeenCalledWith(
        "raw",
        new TextEncoder().encode(customKey),
        { name: "PBKDF2" },
        false,
        ["deriveKey"],
      );
    });
  });

  describe("decrypt", () => {
    const mockEncryptedData = "base64encodeddata";

    beforeEach(() => {
      const combined = new Uint8Array([...mockIv, ...mockEncrypted]);
      global.atob = vi.fn(() => String.fromCharCode(...combined));
    });

    it("should decrypt data successfully", async () => {
      const result = await EncryptionService.decrypt(mockEncryptedData);

      expect(global.atob).toHaveBeenCalledWith(mockEncryptedData);
      expect(mockCrypto.subtle.decrypt).toHaveBeenCalledWith(
        { name: "AES-GCM", iv: mockIv },
        mockKey,
        mockEncrypted,
      );

      expect(result).toBe(testData);
    });

    it("should return null when decryption fails", async () => {
      mockCrypto.subtle.decrypt.mockRejectedValue(
        new Error("Decryption failed"),
      );

      const result = await EncryptionService.decrypt(mockEncryptedData);

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(
        "Decryption failed:",
        expect.any(Error),
      );
    });

    it("should handle invalid base64 data", async () => {
      global.atob = vi.fn(() => {
        throw new Error("Invalid base64");
      });

      const result = await EncryptionService.decrypt("invalid-base64");

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(
        "Decryption failed:",
        expect.any(Error),
      );
    });

    it("should handle malformed encrypted data", async () => {
      const shortData = new Uint8Array([1, 2, 3]);
      global.atob = vi.fn(() => String.fromCharCode(...shortData));

      mockCrypto.subtle.decrypt.mockRejectedValueOnce(
        new Error("Invalid data length"),
      );

      const result = await EncryptionService.decrypt(mockEncryptedData);

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(
        "Decryption failed:",
        expect.any(Error),
      );
    });
  });

  describe("key management", () => {
    it("should create key with correct parameters", async () => {
      await EncryptionService.encrypt(testData);

      expect(mockCrypto.subtle.importKey).toHaveBeenCalledWith(
        "raw",
        expect.any(Uint8Array),
        { name: "PBKDF2" },
        false,
        ["deriveKey"],
      );

      expect(mockCrypto.subtle.deriveKey).toHaveBeenCalledWith(
        {
          name: "PBKDF2",
          salt: new TextEncoder().encode("salt"),
          iterations: 100000,
          hash: "SHA-256",
        },
        mockKeyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"],
      );
    });

    it("should cache the derived key", async () => {
      await EncryptionService.encrypt(testData);
      await EncryptionService.encrypt("another test");

      expect(mockCrypto.subtle.importKey).toHaveBeenCalledTimes(1);
      expect(mockCrypto.subtle.deriveKey).toHaveBeenCalledTimes(1);
    });
  });

  describe("error handling", () => {
    it("should handle key generation errors in encrypt", async () => {
      mockCrypto.subtle.importKey.mockRejectedValue(
        new Error("Key generation failed"),
      );

      await expect(EncryptionService.encrypt(testData)).rejects.toThrow(
        "Key generation failed",
      );
    });

    it("should handle encryption errors", async () => {
      mockCrypto.subtle.encrypt.mockRejectedValue(
        new Error("Encryption failed"),
      );

      await expect(EncryptionService.encrypt(testData)).rejects.toThrow(
        "Encryption failed",
      );
    });

    it("should handle key generation errors in decrypt", async () => {
      mockCrypto.subtle.importKey.mockRejectedValue(
        new Error("Key generation failed"),
      );

      const result = await EncryptionService.decrypt("somedata");

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(
        "Decryption failed:",
        expect.any(Error),
      );
    });
  });
});
