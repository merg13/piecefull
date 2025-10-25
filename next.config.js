/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      // Add your S3 bucket domain here
      process.env.AWS_S3_BUCKET ? `${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com` : '',
      // Add other image domains as needed
    ].filter(Boolean),
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
        port: '',
        pathname: '/**',
      }
    ]
  },
  experimental: {
    // Enable if you want to use server components
    serverComponentsExternalPackages: ['sharp']
  },
  // Webpack configuration for handling audio files
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(mp3|wav|ogg)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/audio/',
          outputPath: 'static/audio/',
        },
      },
    });
    return config;
  },
}

module.exports = nextConfig
