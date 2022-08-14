/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  experimental: {
    outputStandalone: true,
  },
  async rewrites() {
    // eslint-disable-next-line no-process-env
    return process.env.NODE_ENV === 'production' ? [] : [{
      source: '/identity-api/:path*',
      destination: 'http://localhost:3001/:path*',
    }, {
      source: '/chat-api/:path*',
      destination: 'http://localhost:3003/:path*',
    }];
  },
};

module.exports = nextConfig;
