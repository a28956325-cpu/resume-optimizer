import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "pdf-parse",
    "@prisma/client",
    "pdfjs-dist",
    "@ilovepdf/ilovepdf-nodejs",
    "@ilovepdf/ilovepdf-js-core",
  ],
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default nextConfig;
