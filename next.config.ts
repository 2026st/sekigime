import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;

/** Cloudflare ローカル開発用。Vercel / 本番ビルドでは読み込まない */
if (!process.env.VERCEL && process.env.NODE_ENV === "development") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare") as {
    initOpenNextCloudflareForDev: () => void;
  };
  initOpenNextCloudflareForDev();
}
