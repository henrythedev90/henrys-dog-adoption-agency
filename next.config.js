/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "frontend-take-home.fetch.com",
        pathname: "/dog-images/**",
      },
    ],
  },
};

module.exports = nextConfig;
