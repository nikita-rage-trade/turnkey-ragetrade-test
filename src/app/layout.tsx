"use client";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@turnkey/sdk-react/styles";
import { wagmiConfig } from "@/wagmi/config";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EthereumWalletProvider } from "@/ethereum-wallet";
import { AppTurnkeyProvider, TurnkeyWalletProvider } from "@/turnkey";
import { SolanaWeb3Provider } from "@/solana-wallet/SolanaWeb3Provider";
import { SolanaWalletProvider } from "@/solana-wallet/SolanaWalletProvider";
import { SyncWallets } from "@/wallets/SyncWallets";

const inter = Inter({ subsets: ["latin"] });

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <EthereumWalletProvider>
          <SolanaWalletProvider>
            <SolanaWeb3Provider>
              <QueryClientProvider client={queryClient}>
                <WagmiProvider config={wagmiConfig}>
                  <AppTurnkeyProvider>
                    <TurnkeyWalletProvider>
                      <SyncWallets />
                      {children}
                    </TurnkeyWalletProvider>
                  </AppTurnkeyProvider>
                </WagmiProvider>
              </QueryClientProvider>
            </SolanaWeb3Provider>
          </SolanaWalletProvider>
        </EthereumWalletProvider>
      </body>
    </html>
  );
}
