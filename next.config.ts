import withPWA from 'next-pwa';

const nextConfig = {
  // Any other Next.js config options here
};

export default withPWA({
  ...nextConfig,
  dest: 'public',
  register: true,
  skipWaiting: true,
});
