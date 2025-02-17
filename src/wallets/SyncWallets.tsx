import { wagmiConfig } from "@/wagmi/config";
import { useEffect } from "react";
import * as wagmiActions from "wagmi/actions";
import { useEthereumWallet } from "@/ethereum-wallet/EthereumWalletProvider";
import * as wagmi from "wagmi";
import { EthereumAddress } from "@/web3";

import { useTurnkey } from "@turnkey/sdk-react";
import { useTurnkeyWallet } from "@/turnkey/TurnkeyWalletProvider";
import { TurnkeySigner } from "@turnkey/solana";
import { useSolanaWallet } from "@/solana-wallet/SolanaWalletProvider";
import * as solanaLibReact from "@solana/wallet-adapter-react";
import * as solanaLibWeb3 from "@solana/web3.js";

const TURNKEY_WALLET_ID = "turnkey";
export function SyncWallets() {
  const { authIframeClient } = useTurnkey();
  const { wallet: turnkeyWallet } = useTurnkeyWallet();
  const wagmiAccount = wagmi.useAccount();
  const solanaLibWallet = solanaLibReact.useWallet();
  const solanaLibAnchorWallet = solanaLibReact.useAnchorWallet();
  const { connection: solanaConnection } = solanaLibReact.useConnection();
  const { disconnectAsync: wagmiDisconnect } = wagmi.useDisconnect();
  const { setEthereumWallet, ethereumWallet } = useEthereumWallet();
  const { setSolanaWallet, solanaWallet } = useSolanaWallet();

  // Wagmi Ethereum
  useEffect(() => {
    (async () => {
      if (wagmiAccount.address) {
        const id = wagmiAccount.connector?.id ?? "";

        if (ethereumWallet && ethereumWallet.id !== id) {
          await ethereumWallet.disconnect();
        }

        setEthereumWallet({
          id: id,
          address: wagmiAccount.address,
          chainId: wagmiAccount.chainId!,
          getWalletClient: () => wagmiActions.getWalletClient(wagmiConfig),
          switchChain: async (chainId) => {
            await wagmiActions.switchChain(wagmiConfig, { chainId });
          },
          disconnect: () => wagmiDisconnect(),
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wagmiAccount.address, wagmiAccount.chainId]);

  // Turnkey Ethereum
  useEffect(() => {
    (async () => {
      if (turnkeyWallet) {
        const turnkeyEthereumWallet = turnkeyWallet.ethereum;

        if (ethereumWallet && ethereumWallet.id !== TURNKEY_WALLET_ID) {
          await ethereumWallet.disconnect();
        }

        if (authIframeClient && turnkeyWallet.organizationId) {
          setEthereumWallet({
            id: TURNKEY_WALLET_ID,
            address: turnkeyEthereumWallet.address,
            chainId: turnkeyEthereumWallet.chainId,
            getWalletClient: turnkeyEthereumWallet.getWalletClient,
            switchChain: async (newChainId) => turnkeyEthereumWallet.setChainId(newChainId),
            disconnect: () => turnkeyWallet.disconnect(),
          });
        }
      } else if (ethereumWallet) {
        if (ethereumWallet.id === TURNKEY_WALLET_ID) {
          await ethereumWallet.disconnect();
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnkeyWallet?.ethereum]);

  // Turnkey Solana
  useEffect(() => {
    (async () => {
      const id = "turnkey";

      if (turnkeyWallet) {
        const turnkeySolanaWallet = turnkeyWallet.solana;

        if (solanaWallet && solanaWallet.id !== id) {
          await solanaWallet.disconnect();
        }

        if (authIframeClient && turnkeyWallet.organizationId) {
          const turnkeySigner = new TurnkeySigner({
            organizationId: turnkeyWallet.organizationId,
            client: authIframeClient,
          });

          setSolanaWallet({
            id,
            address: turnkeySolanaWallet.address,
            connection: solanaConnection,
            disconnect: () => turnkeyWallet.disconnect(),
            anchorWallet: {
              publicKey: turnkeySolanaWallet.address,
              signTransaction<T extends solanaLibWeb3.Transaction | solanaLibWeb3.VersionedTransaction>(
                transaction: T,
              ) {
                return turnkeySigner.signTransaction(transaction, turnkeySolanaWallet.address.toString()) as Promise<T>;
              },
              signAllTransactions<T extends solanaLibWeb3.Transaction | solanaLibWeb3.VersionedTransaction>(
                transaction: T[],
              ) {
                return turnkeySigner.signAllTransactions(
                  transaction,
                  turnkeySolanaWallet.address.toString(),
                ) as Promise<T[]>;
              },
            },
          });
        }
      } else if (solanaWallet) {
        if (solanaWallet.id === id) {
          await solanaWallet.disconnect();
        }
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnkeyWallet?.solana]);

  // Solana Lib
  useEffect(() => {
    (async () => {
      if (solanaLibWallet.publicKey && solanaLibAnchorWallet) {
        const id = solanaLibWallet.wallet?.adapter.name ?? "solana";

        if (solanaWallet && solanaWallet.id !== id) {
          await solanaWallet.disconnect();
        }

        setSolanaWallet({
          id,
          address: solanaLibWallet.publicKey,
          disconnect: () => solanaLibWallet.disconnect(),
          connection: solanaConnection,
          anchorWallet: solanaLibAnchorWallet,
        });
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solanaLibWallet.publicKey]);

  return null;
}
