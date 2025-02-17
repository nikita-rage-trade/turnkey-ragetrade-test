import { Promisable } from "@/types";
import { BlockchainType, SolanaAddress } from "@/web3";
import { AnchorProvider } from "@coral-xyz/anchor";
import { Connection, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";

export interface AnchorWallet {
  publicKey: PublicKey;
  signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;
}

export type SolanaWallet = {
  id: string;
  blockchainType: BlockchainType.Solana;
  address: SolanaAddress;
  disconnect: () => Promise<void>;
  connection: Connection;
  anchorProvider: AnchorProvider;
  anchorWallet: AnchorWallet;
};

export type SolanaWalletState = {
  solanaWallet: SolanaWallet | null;
};

export type SolanaWalletActions = {
  setSolanaWallet(props: {
    id: string;
    address: SolanaAddress;
    disconnect: () => Promise<void>;
    anchorWallet: AnchorWallet;
    connection: Connection;
  }): void;
};

export type SolanaWalletStore = SolanaWalletState & SolanaWalletActions;
