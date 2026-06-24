/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export so the single-player game can be served by GitHub Pages
  // (Pages can't run a Next.js server). Produces a fully static site in ./out.
  output: 'export',
  // Project page lives at nicolasdmo.github.io/vpet, so assets resolve under /vpet.
  basePath: '/vpet',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
