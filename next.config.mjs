/** @type {import('next').NextConfig} */
const nextConfig = {
  // The game engine under src/game uses explicit .ts import extensions so it can be
  // shared verbatim with the Deno-based Supabase Edge Function. Allow that here.
  experimental: {},
};

export default nextConfig;
