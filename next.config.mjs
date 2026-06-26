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
  // Exposed to the client so raw <img src> for sprites resolves under the right
  // base on both targets (Next doesn't auto-prefix basePath on plain <img>).
  env: { NEXT_PUBLIC_BASE_PATH: isGithubPages ? '/vpet' : '' },
  images: { unoptimized: true },
};

export default nextConfig;
