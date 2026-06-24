/** @type {import('next').NextConfig} */

// The same repo deploys to two targets:
//  - GitHub Pages (static, project page at /vpet): set GITHUB_PAGES=true (see the
//    Actions workflow) -> static export under basePath '/vpet'.
//  - Vercel / local: full Next.js app at the domain root (no export, no basePath) so
//    the online half (SSR, route handlers, Supabase) can run later.
const isGithubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  ...(isGithubPages
    ? { output: 'export', basePath: '/vpet', trailingSlash: true }
    : {}),
  images: { unoptimized: true },
};

export default nextConfig;
