import { EthereumAddress } from "@/web3";
import { PublicKey } from "@solana/web3.js";
import { DEFAULT_ETHEREUM_ACCOUNTS, DEFAULT_SOLANA_ACCOUNTS } from "@turnkey/sdk-browser";
import { useTurnkey } from "@turnkey/sdk-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { arbitrum } from "viem/chains";
import { create } from "zustand";
import { createAccount } from "@turnkey/viem";
import { createWalletClient, http, WalletClient } from "viem";
import { getViemChainById } from "@/wagmi/utils";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Transaction, VersionedTransaction } from "@solana/web3.js";
import { TurnkeySigner } from "@turnkey/solana";

interface TurnkeyWalletProviderProps {
  children: React.ReactNode;
}

type TurnkeyWalletContextValue = {
  isLoading: boolean;
  wallet: {
    disconnect: () => Promise<void>;
    organizationId: string;
    ethereum: {
      walletId: string;
      address: EthereumAddress;
      getWalletClient: () => Promise<WalletClient | undefined>;
      chainId: number;
      setChainId: (chainId: number) => void;
    };
    solana: {
      walletId: string;
      address: PublicKey;
      anchorWallet: AnchorWallet;
    };
  } | null;
  connect: () => Promise<void>;
};

const TurnkeyWalletContext = createContext<TurnkeyWalletContextValue>(null as any);

const TurnkeyWalletStore = create<{
  wallet: {
    solana: {
      walletId: string;
      address: PublicKey;
      anchorWallet: AnchorWallet;
    };
    ethereum: {
      walletId: string;
      address: EthereumAddress;
      getWalletClient: () => Promise<WalletClient | undefined>;
      chainId: number;
    };
    organizationId: string;
  } | null;
}>(() => ({
  wallet: null,
}));

export function TurnkeyWalletProvider({ children }: TurnkeyWalletProviderProps) {
  const { turnkey, authIframeClient } = useTurnkey();
  const { wallet } = TurnkeyWalletStore();
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  const isLoading = useMemo(() => isAuthenticating || !authIframeClient, [isAuthenticating, authIframeClient]);

  const connect = useCallback(async () => {
    setIsAuthenticating(true);

    const loadAccount = async () => {
      if (turnkey && authIframeClient) {
        const whoami = await authIframeClient.getWhoami();

        const walletsResponse = await authIframeClient.getWallets({
          organizationId: whoami.organizationId,
        });

        if (walletsResponse.wallets.length > 0) {
          const defaultWalletId = walletsResponse.wallets[0].walletId;

          const accountsResponse = await authIframeClient.getWalletAccounts({
            organizationId: whoami.organizationId,
            walletId: defaultWalletId,
          });

          let accounts = accountsResponse.accounts;

          if (accountsResponse.accounts.length === 0) {
            await authIframeClient.createWalletAccounts({
              walletId: defaultWalletId,
              accounts: [...DEFAULT_ETHEREUM_ACCOUNTS, ...DEFAULT_SOLANA_ACCOUNTS],
            });

            const accountsResponse = await authIframeClient.getWalletAccounts({
              organizationId: whoami.organizationId,
              walletId: defaultWalletId,
            });

            accounts = accountsResponse.accounts;
          }

          const ethereumAccount = accounts.find((acc) => acc.addressFormat === "ADDRESS_FORMAT_ETHEREUM")!;
          const solanaAccount = accounts.find((acc) => acc.addressFormat === "ADDRESS_FORMAT_SOLANA")!;

          // Solana
          const turnkeySigner = new TurnkeySigner({
            organizationId: whoami.organizationId,
            client: authIframeClient,
          });

          const publicKey = new PublicKey(solanaAccount.address);

          const anchorWallet: AnchorWallet = {
            publicKey,
            signTransaction<T extends Transaction | VersionedTransaction>(transaction: T) {
              return turnkeySigner.signTransaction(transaction, solanaAccount.address) as Promise<T>;
            },
            signAllTransactions<T extends Transaction | VersionedTransaction>(transaction: T[]) {
              return turnkeySigner.signAllTransactions(transaction, solanaAccount.address) as Promise<T[]>;
            },
          };

          TurnkeyWalletStore.setState({
            wallet: {
              ethereum: {
                walletId: ethereumAccount.walletId,
                address: ethereumAccount.address as EthereumAddress,
                getWalletClient: async () => {
                  const ethereumWallet = TurnkeyWalletStore.getState().wallet?.ethereum;

                  if (!ethereumWallet) {
                    return;
                  }

                  const turnkeyAccount = await createAccount({
                    client: authIframeClient,
                    organizationId: whoami.organizationId,
                    signWith: ethereumWallet.address,
                    ethereumAddress: ethereumWallet.address,
                  });

                  const walletClient = createWalletClient({
                    account: turnkeyAccount,
                    chain: getViemChainById(ethereumWallet.chainId),
                    transport: http(),
                  });

                  return walletClient;
                },
                chainId: arbitrum.id,
              },
              solana: {
                walletId: solanaAccount.walletId,
                address: anchorWallet.publicKey,
                anchorWallet,
              },
              organizationId: whoami.organizationId,
            },
          });
        }
      }
    };

    if (turnkey && authIframeClient) {
      const session = await turnkey.getReadWriteSession();

      const isSessionReady = !!session && Date.now() < session.expiry;

      if (isSessionReady) {
        await authIframeClient.injectCredentialBundle(session!.credentialBundle);
        await loadAccount();
      }
    }

    setIsAuthenticating(false);
  }, [turnkey, authIframeClient]);

  useEffect(() => {
    if (authIframeClient) {
      connect();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authIframeClient]);

  const value: TurnkeyWalletContextValue = useMemo(() => {
    return {
      isLoading: isLoading,
      isAuthenticating: isAuthenticating,
      wallet: wallet
        ? {
            organizationId: wallet.organizationId,
            ethereum: {
              ...wallet.ethereum,
              setChainId(chainId) {
                TurnkeyWalletStore.setState({
                  wallet: {
                    ...wallet,
                    ethereum: {
                      ...wallet.ethereum,
                      chainId,
                    },
                  },
                });
              },
            },
            solana: wallet.solana,
            disconnect: async () => {
              if (turnkey) {
                await turnkey.logoutUser();
                TurnkeyWalletStore.setState({ wallet: null });
              }
            },
          }
        : null,
      connect,
    };
  }, [connect, isAuthenticating, isLoading, turnkey, wallet]);

  return <TurnkeyWalletContext.Provider value={value}>{children}</TurnkeyWalletContext.Provider>;
}

export function useTurnkeyWallet() {
  return useContext(TurnkeyWalletContext);
}
