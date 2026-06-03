// Lovable hosting uses the standard Lovable TanStack config.
// Vercel needs a Nitro/Vercel server output instead of the Cloudflare build target.
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig as defineLovableConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";
import { fileURLToPath, URL } from "node:url";
import { defineConfig as defineViteConfig, type ConfigEnv } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

const lovableConfig = defineLovableConfig();

export default async function config(env: ConfigEnv) {
  if (process.env.VERCEL === "1") {
    return defineViteConfig({
      server: { host: "::", port: 8080 },
      resolve: {
        alias: {
          "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
        dedupe: ["react", "react-dom", "react/jsx-runtime", "@tanstack/react-query", "@tanstack/query-core"],
      },
      plugins: [tailwindcss(), tsConfigPaths({ projects: ["./tsconfig.json"] }), tanstackStart(), nitro({ preset: "vercel" }), viteReact()],
    });
  }

  return lovableConfig(env);
}
