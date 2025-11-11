import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 實驗性功能：優化套件匯入
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },

  // 啟用 gzip 壓縮
  compress: true,

  // React Strict Mode
  reactStrictMode: true,

  // 圖片優化
  images: {
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
