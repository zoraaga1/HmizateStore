/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'prd.place',
    },
    {
      protocol: 'https',
      hostname: 'picsum.photos',
    },
  ],
},

  devIndicators: false
  };
  
module.exports = nextConfig;
