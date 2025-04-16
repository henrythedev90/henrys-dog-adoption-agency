/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "frontend-take-home-service.fetch.com",
        pathname: "/dog-images/**",
      },
    ],
  },
};

module.exports = nextConfig;
