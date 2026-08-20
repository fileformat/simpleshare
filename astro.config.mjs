import { defineConfig } from "astro/config";
import node from "@astrojs/node";

export default defineConfig({
    output: "server",
    adapter: node({ mode: "standalone" }),
    build: {
        format: "directory",
    },
    server: {
        port: process.env.PORT ? parseInt(process.env.PORT) : 4000,
        host: true,
    },
});
