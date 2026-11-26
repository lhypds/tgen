import { defineConfig, loadEnv } from "vite";
import { fileURLToPath, URL } from "node:url";
import { brainPlugin } from "./server/brain.js";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.PORT) || 5173;
  // Public hostname(s) behind the reverse proxy, comma-separated. Vite blocks every
  // name it wasn't told about; empty means local development (localhost only).
  const allowedHosts = (env.HOST ?? "")
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);

  return {
    plugins: [brainPlugin(env)],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
        "@utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
      },
    },
    server: {
      host: "0.0.0.0",
      port,
      allowedHosts,
      strictPort: true,
    },
    preview: {
      host: "0.0.0.0",
      port,
      allowedHosts,
      strictPort: true,
    },
  };
});
