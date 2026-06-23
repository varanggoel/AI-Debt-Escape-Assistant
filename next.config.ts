import type { NextConfig } from "next";

const config: NextConfig = {
  // Strict mode catches double-render bugs in development
  reactStrictMode: true,
  // Allow images from Google (OAuth avatars)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default config;
