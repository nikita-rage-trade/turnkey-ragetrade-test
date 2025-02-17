import { createContext, useContext, useCallback, ReactNode, useMemo } from "react";
import { EthereumWallet, EthereumWalletContextType } from "./types";
import { BlockchainType } from "@/web3";
import { create } from "zustand";

const EthereumWalletContext = createContext<EthereumWalletContextType>(null as any);

const store = create<{ wallet: EthereumWallet | null }>(() => ({
  wallet: null,
}));

const useStore = store;

export function EthereumWalletProvider({ children }: { children: ReactNode }) {
  const ethereumWallet = useStore((s) => s.wallet);

  const value: EthereumWalletContextType = useMemo(
    () => ({
      ethereumWallet,
      setEthereumWallet: async (props) => {
        store.setState({
          wallet: {
            id: props.id,
            async switchChain(chainId) {
              const actualWallet = store.getState().wallet;
              if (actualWallet) {
                await props.switchChain(chainId);
                store.setState({
                  wallet: { ...actualWallet, chainId },
                });
              }
            },
            async disconnect() {
              await props.disconnect();
              store.setState({ wallet: null });
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
