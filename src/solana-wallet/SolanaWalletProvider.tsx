import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnchorWallet, SolanaWallet, SolanaWalletStore } from "./types";
import { BlockchainType } from "@/web3";
import { AnchorProvider } from "@coral-xyz/anchor";

const SolanaWalletContext = createContext<SolanaWalletStore>(null as any);

interface SolanaWalletProviderProps {
  children: React.ReactNode;
}

export function SolanaWalletProvider(props: SolanaWalletProviderProps) {
  const [wallet, setWalletState] = useState<SolanaWallet | null>(null);

  const setWallet: SolanaWalletStore["setSolanaWallet"] = useCallback((props) => {
    setWalletState({
      id: props.id,
      blockchainType: BlockchainType.Solana,
      address: props.address,
      disconnect: async () => {
        try {
          await props.disconnect();
          setWalletState(null);
        } catch {}
      },
      anchorProvider: new AnchorProvider(props.connection, props.anchorWallet, AnchorProvider.defaultOptions()),
      connection: props.connection,
      anchorWallet: props.anchorWallet,
    });
  }, []);

  return (
    <SolanaWalletContext.Provider value={{ solanaWallet: wallet, setSolanaWallet: setWallet }}>
      {props.children}
    </SolanaWalletContext.Provider>
  );
}

export function useSolanaWallet() {
  const context = useContext(SolanaWalletContext);

  if (!context) {
    throw new Error("useSolanaWallet must be used within a SolanaWalletProvider");
  }

  return context;
}
