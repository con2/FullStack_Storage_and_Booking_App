import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode, but prioritize process.env (from env-cmd)
  let env = {} as Record<string, string>;

  // First, try to get from process.env (set by env-cmd)
  if (process.env.VITE_SUPABASE_URL) {
    env = {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || "",
      VITE_API_URL: process.env.VITE_API_URL || "",
    };
    console.log("Using environment variables from env-cmd/process.env");
  } else {
    // Fallback to loading from .env files
    try {
      if (mode === "development") {
        env = loadEnv(mode, path.resolve(__dirname, ".."), "");
        console.log("Loaded environment from:", path.resolve(__dirname, ".."));
      } else {
        // Default to production or any other mode
        env = loadEnv(mode, process.cwd(), "");
        console.log("Loaded environment from:", process.cwd());
      }
    } catch (error) {
      console.warn(
        `Failed to load environment variables for mode '${mode}':`,
        error,
      );
    }
  }

  // Logging with fallback information
  console.log(`Running in ${mode} mode with environment:`, {
    VITE_SUPABASE_URL: env.VITE_SUPABASE_URL ? "✓ Found" : "❌ Missing",
    VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY
      ? "✓ Found"
      : "❌ Missing",
    VITE_API_URL: env.VITE_API_URL
      ? `✓ ${env.VITE_API_URL}`
      : "❌ Will use http://localhost:3000",
  });

  return {
    plugins: [react(), tailwindcss(), svgr()],
    server: {
      port: 5180,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@common": path.resolve(__dirname, "../common"),
      },
    },
    define: {
      // Ensure these are properly stringified for the client
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
        env.VITE_SUPABASE_URL,
      ),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(
        env.VITE_SUPABASE_ANON_KEY,
      ),
      "import.meta.env.VITE_API_URL": JSON.stringify(
        env.VITE_API_URL || "http://localhost:3000",
      ),
    },
  };
});
