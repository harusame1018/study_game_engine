import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 8080,
    open: true,
  },
  build: {
    // 本番ビルド用のターゲットを設定
    target: 'es2022'
  },
});
