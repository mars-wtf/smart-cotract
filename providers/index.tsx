"use client";

import * as React from "react";
import NotificationProvider from "@/contexts/NotificationContext";
import {
  RainbowKitProvider,
  getDefaultWallets,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  trustWallet,
  ledgerWallet,
  phantomWallet,
  okxWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { base, sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
//@ts-ignore
import { WagmiProvider } from "wagmi";
import ActiveWeb3Provider from "@/contexts/Web3Context";

const { wallets } = getDefaultWallets();

const config = getDefaultConfig({
  appName: "RainbowKit demo",
  projectId: "e89228fed40d4c6e9520912214dfd68b",
  wallets: [
    ...wallets,
    {
      groupName: "Other",
      wallets: [metaMaskWallet, phantomWallet, trustWallet],
    },
  ],
  chains: [
    base,
    sepolia,
    // ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
  ],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <NotificationProvider>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <ActiveWeb3Provider>
              {children}
            </ActiveWeb3Provider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </NotificationProvider>
    </WagmiProvider>
  );
}
