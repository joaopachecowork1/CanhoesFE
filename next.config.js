const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/uploads/:path*",
      },
    ];
  },
  images: {
    // Images served via /api/uploads/ are same-origin — no remotePatterns needed.
    // For external backend media URLs, add remotePatterns here:
    // remotePatterns: [
    //   { protocol: "https", hostname: "your-backend-domain.com" },
    // ],
    formats: ["image/webp"],
  },
};

module.exports = nextConfig;
