import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  resolve: {
    alias: {
      // "server-only"는 Next.js 웹팩 번들링 시점에만 클라이언트 유입을 막는 가드라서
      // vitest(순수 Node) 환경에서는 항상 예외를 던진다. 테스트에서는 no-op으로 대체.
      "server-only": path.resolve(__dirname, "test/stubs/server-only.ts"),
    },
  },
  test: {
    environment: "node",
    setupFiles: ["./test/setup.ts"],
  },
});
