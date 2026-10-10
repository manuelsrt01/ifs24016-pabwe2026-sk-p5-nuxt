import { defineNuxtConfig } from "nuxt/config";
import tailwindcss from "@tailwindcss/vite";

const customPort = Number(process.env.APP_PORT || process.env.PORT) || 3000;

const fontUrl =
  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  telemetry: false,

  // Disable SSR for SPA mode (client-side routing and storage)
  ssr: false,

  // Let Nuxt look into src/ for application source files
  srcDir: "src/",

  // Enable vue-router; routes are supplied by src/router.options.ts
  pages: true,

  css: ["~/index.css"],

  modules: ["@pinia/nuxt"],

  vite: {
    plugins: [tailwindcss()],
    define: {
      DELCOM_BASEURL: JSON.stringify(
        process.env.VITE_DELCOM_BASEURL || "https://open-api.delcom.org/api/v1",
      ),
    },
    build: {
      chunkSizeWarningLimit: 1500,
    },
  },

  devServer: {
    port: customPort,
  },

  app: {
    head: {
      title: "Delcom Cash Flow",
      htmlAttrs: {
        lang: "id",
      },
      meta: [
        {
          name: "description",
          content:
            "Delcom Cash Flow - aplikasi pencatat arus kas pribadi: catat pemasukan dan pengeluaran, pantau saldo tunai, tabungan, dan pinjaman.",
        },
      ],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/logo.svg" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        // Font dimuat non-blocking: dianggap print dulu, lalu diaktifkan setelah selesai diunduh
        {
          rel: "stylesheet",
          href: fontUrl,
          media: "print",
          onload: "this.media='all'",
        },
      ],
      bodyAttrs: {
        class: "bg-slate-50 text-slate-900 font-sans antialiased min-h-screen",
      },
    },
  },
});
