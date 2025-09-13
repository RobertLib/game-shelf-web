import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.tsx"],
    deps: {
      optimizer: {
        web: {
          exclude: ["lucide-react"],
        },
      },
    },
  },
});
