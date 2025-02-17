import { arbitrum, mainnet, optimism } from "viem/chains";

export const getViemChainById = (chainId: number) =>
  ({
    1: mainnet,
    42161: arbitrum,
    10: optimism,
  })[chainId];
