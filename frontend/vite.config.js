import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite is just the dev-server/bundler for our React app (replaces the old
// Create-React-App tooling). It does not add any framework of its own —
// we are still writing plain React.js.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
});
