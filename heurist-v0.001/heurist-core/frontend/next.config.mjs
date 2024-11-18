/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
      return [
        {
          source: "/:path*",
          destination: "http://localhost:8000/:path*", // Substitua pelo URL do backend
        },
      ];
    },
  };
  
  export default nextConfig;
  