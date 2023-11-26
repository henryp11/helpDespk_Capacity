/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // env: {
  //   customKey: 'customValue',
  // },
  // // basePath: '/dist'
  // compress: true,
  // async redirects() {
  //   return [
  //     {
  //       source: '/hola',
  //       destination: 'https://github.com/henryp11',
  //       permanent: true,
  //     },
  //   ];
  // },
};

// const withPWA = require("next-pwa")({
//   dest: "public",
//   include: ["production"],
//   register: true,
//   disable: process.env.NODE_ENV === "development",
// });

// module.exports = withPWA(nextConfig);
module.exports = nextConfig;
