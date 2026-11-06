/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Remote image hosts allowed by next/image. Add a host here if you add
    // product/blog images from somewhere new.
    remotePatterns: [
      { protocol: "https", hostname: "contents.mediadecathlon.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // `next build` in Next 14 doesn't understand ESLint 9 flat config, so linting
  // is run separately with `npm run lint`.
  eslint: { ignoreDuringBuilds: true },
};

module.exports = nextConfig;
