import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
  },
  // Loaded by Node as written, the way Next.js already treats `pg` and `@prisma/client`.
  serverExternalPackages: ["@prisma/adapter-neon"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
