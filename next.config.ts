import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/new/drain-tower-100", destination: "/new/drain-tower-80", permanent: true },
      { source: "/new/drain-tower-230", destination: "/new/drain-tower-160", permanent: true },
    ];
  },
};

export default nextConfig;
