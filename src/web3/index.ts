import { PublicKey } from "@solana/web3.js";

export enum BlockchainType {
  Ethereum = "Ethereum",
  Solana = "Solana",
}

export type EthereumAddress = `0x${string}`;

export type SolanaAddress = PublicKey;
