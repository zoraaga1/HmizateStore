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
    {
      protocol: 'https',
      hostname: 'rowv7m9afq9bnl4p.public.blob.vercel-storage.com',
    },
    { hostname: "*.public.blob.vercel-storage.com" },
  ],
},

  devIndicators: false
  };
  
module.exports = nextConfig;
