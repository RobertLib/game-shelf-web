import logger from "./logger";

class EncryptionService {
  private static key: CryptoKey | null = null;

  private static async getKey(): Promise<CryptoKey> {
    if (this.key) return this.key;

    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(
        import.meta.env.VITE_ENCRYPTION_KEY ||
          "default-key-32-chars-long-123456",
      ),
      { name: "PBKDF2" },
      false,
      ["deriveKey"],
    );

    this.key = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: new TextEncoder().encode("salt"),
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    );

    return this.key;
  }

  static async encrypt(data: string): Promise<string> {
    const key = await this.getKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(data);

    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encodedData,
    );

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  static async decrypt(encryptedData: string): Promise<string | null> {
    try {
      const key = await this.getKey();
      const combined = new Uint8Array(
        atob(encryptedData)
          .split("")
          .map((char) => char.charCodeAt(0)),
      );

      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        encrypted,
      );

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      logger.error("Decryption failed:", error);
      return null;
    }
  }
}

export default EncryptionService;
