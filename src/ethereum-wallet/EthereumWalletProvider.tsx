import { createContext, useContext, useCallback, ReactNode, useMemo } from "react";
import { EthereumWallet, EthereumWalletStore } from "./types";
import { BlockchainType } from "@/web3";
import { create } from "zustand";

const EthereumWalletContext = createContext<EthereumWalletStore | null>(null);

const WalletStore = create<{ wallet: EthereumWallet | null }>(() => ({
  wallet: null,
}));

export function EthereumWalletProvider({ children }: { children: ReactNode }) {
  const ethereumWallet = WalletStore((s) => s.wallet);

  const value: EthereumWalletStore = useMemo(
    () => ({
      ethereumWallet,
      setEthereumWallet: async (props) => {
        WalletStore.setState({
          wallet: {
            id: props.id,
            async switchChain(chainId) {
              const actualWallet = WalletStore.getState().wallet;
              if (actualWallet) {
                await props.switchChain(chainId);
                WalletStore.setState({
                  wallet: { ...actualWallet, chainId },
                });
              }
            },
            async disconnect() {
              await props.disconnect();
              WalletStore.setState({ wallet: null });
            },
            getWalletClient: props.getWalletClient,
            address: props.address,
            chainId: props.chainId,
            blockchainType: BlockchainType.Ethereum,
          },
        });
      },
    }),
    [ethereumWallet],
  );

  return <EthereumWalletContext.Provider value={value}>{children}</EthereumWalletContext.Provider>;
}

export function useEthereumWallet() {
  const context = useContext(EthereumWalletContext);

  if (!context) {
    throw new Error("useEthereumWallet must be used within an EthereumWalletProvider");
  }

  return context;
}
