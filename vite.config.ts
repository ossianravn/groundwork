import { fileURLToPath, URL } from "node:url"
import { configDefaults } from "vitest/config"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    // Review evidence and local notes may hold copied sources; test the live tree.
    exclude: [...configDefaults.exclude, ".artifacts/**", ".dev-docs/**"],
    // Vitest blanks CSS by default; the kit boundary test reads these as text.
    css: { include: [/src\/kit\/styles\/[^/]+\.css/u] },
  },
})
