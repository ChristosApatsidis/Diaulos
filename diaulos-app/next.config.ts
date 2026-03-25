// next.config.ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  reactCompiler: true, // Enable the new React Server Components compiler
  allowedDevOrigins: ["192.168.1.182"],
};

// Wrap the Next.js config with the next-intl plugin
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
