import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Flags stay separate files, loaded when shown, instead of being inlined into the script.
    assetsInlineLimit: (filePath) => (filePath.includes("/flag-icons/") ? false : undefined),
  },
});
