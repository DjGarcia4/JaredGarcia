import { fileURLToPath, URL } from "node:url";

import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

import { projects } from "./src/data/projects.js";
import { certificates } from "./src/data/certificates.js";

// Genera sitemap.xml y robots.txt en el build a partir de las rutas reales.
// Necesita VITE_SITE_URL (ver .env); sin ella solo emite un robots.txt básico.
const seoFiles = (siteUrl) => ({
  name: "seo-files",
  apply: "build",
  generateBundle() {
    const base = siteUrl?.replace(/\/$/, "");
    const robots = ["User-agent: *", "Allow: /"];

    if (base) {
      const paths = [
        "/",
        "/projects",
        "/design-system",
        ...projects.map((p) => `/project/${p.slug}`),
        ...certificates.map((c) => `/certificate/${c.slug}`),
      ];
      const urls = paths
        .map((p) => `  <url><loc>${base}${p}</loc></url>`)
        .join("\n");
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      });
      robots.push(`Sitemap: ${base}/sitemap.xml`);
    } else {
      this.warn("VITE_SITE_URL vacía: no se genera sitemap.xml.");
    }

    this.emitFile({
      type: "asset",
      fileName: "robots.txt",
      source: robots.join("\n") + "\n",
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [vue(), seoFiles(env.VITE_SITE_URL)],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Vendors en chunks propios: cambian poco, así que quedan en caché
          // entre deploys aunque cambie el código del sitio.
          manualChunks: {
            "vendor-vue": ["vue", "vue-router", "pinia"],
            "vendor-gsap": ["gsap"],
            "vendor-icons": [
              "@fortawesome/fontawesome-svg-core",
              "@fortawesome/vue-fontawesome",
            ],
          },
        },
      },
    },
  };
});
