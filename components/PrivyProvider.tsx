'use client';

import { PrivyProvider } from '@privy-io/react-auth';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || "your-privy-app-id"}
      config={{
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets'
          }
        },
        // Optional: Configure appearance
        appearance: {
          theme: 'light',
          accentColor: '#FD8B44',
          showWalletLoginFirst: true,
        }
      }}
    >
      {children}
    </PrivyProvider>
  );
}