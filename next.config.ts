import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    useTypeScriptCli: true,
  },
};

export default nextConfig;
