import { BlockchainType, EthereumAddress } from "@/web3";
import { WalletClient } from "viem";

export type EthereumWallet = {
  id: string;
  blockchainType: BlockchainType.Ethereum;
  address: EthereumAddress;
  chainId: number;
  getWalletClient: () => Promise<WalletClient | undefined>;
  switchChain: (chainId: number) => Promise<void>;
  disconnect: () => Promise<void>;
};

export type EthereumWalletState = {
  ethereumWallet: EthereumWallet | null;
};

export type EthereumWalletActions = {
  setEthereumWallet(props: {
    id: string;
    address: EthereumAddress;
    chainId: number;
    getWalletClient: () => Promise<WalletClient | undefined>;
    switchChain: (chainId: number) => Promise<void>;
    disconnect: () => Promise<void>;
  }): void;
};

export type EthereumWalletContextType = EthereumWalletState & EthereumWalletActions;
