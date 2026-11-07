import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // mysql2 is a Node.js package; keep it out of the bundler so the driver
  // available on the Vercel Node runtime is used directly.
  serverExternalPackages: ["mysql2"],
};

export default nextConfig;
