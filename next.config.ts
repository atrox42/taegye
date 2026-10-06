import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/new/drain-tower-100", destination: "/new/drain-tower-20", permanent: true },
      { source: "/new/drain-tower-120", destination: "/new/drain-tower-40", permanent: true },
      { source: "/new/drain-tower-160", destination: "/new/drain-tower-80", permanent: true },
      { source: "/new/drain-tower-230", destination: "/new/drain-tower-80", permanent: true },
    ];
  },
};

export default nextConfig;
