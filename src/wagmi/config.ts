import { http, createConfig, Config } from "wagmi";
import { arbitrum, mainnet, optimism, sepolia } from "wagmi/chains";

export const wagmiConfig: Config = createConfig({
  chains: [mainnet, arbitrum, optimism],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http()
  }
});
