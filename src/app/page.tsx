"use client";

import {
  DEFAULT_ETHEREUM_ACCOUNTS,
  DEFAULT_SOLANA_ACCOUNTS
} from "@turnkey/sdk-browser";
import { Auth, useTurnkey } from "@turnkey/sdk-react";
import { createAccount } from "@turnkey/viem";
import { ComponentProps, useEffect, useState } from "react";

export default function Home() {
  const { turnkey, authIframeClient, walletClient, client } = useTurnkey();
  const [user, setUser] = useState<any>(null);
  const [suborgId, setSuborgId] = useState("");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (turnkey && authIframeClient) {
        const session = await turnkey.getReadWriteSession();

        if (!session || Date.now() > session!.expiry) {
          await turnkey.logoutUser();
          return;
        }

        await authIframeClient.injectCredentialBundle(session.credentialBundle);

        const whoami = await authIframeClient.getWhoami();

        setSuborgId(whoami.organizationId);

        const userResponse = await authIframeClient.getUser(whoami);

        setUser(userResponse.user);

        const walletsResponse = await authIframeClient.getWallets({
          organizationId: whoami.organizationId
        });

        console.log({ walletsResponse });

        if (walletsResponse.wallets.length > 0) {
          const defaultWalletId = walletsResponse.wallets[0].walletId;

          const accountsResponse = await authIframeClient.getWalletAccounts({
            organizationId: whoami.organizationId,
            walletId: defaultWalletId
          });

          if (accountsResponse.accounts.length > 0) {
            setAccounts(accountsResponse.accounts);
            setSelectedAccount(accountsResponse.accounts[0].address);
          } else {
            await authIframeClient.createWalletAccounts({
              walletId: defaultWalletId,
              accounts: [
                ...DEFAULT_ETHEREUM_ACCOUNTS,
                ...DEFAULT_SOLANA_ACCOUNTS
              ]
            });

            const accountsResponse = await authIframeClient.getWalletAccounts({
              organizationId: whoami.organizationId,
              walletId: defaultWalletId
            });

            setAccounts(accountsResponse.accounts);
          }
        }
      }
    })();
  }, [turnkey, authIframeClient]);

  useEffect(() => {
    (async () => {
      // createAccount()

      const ethereumAccount = accounts.find(
        (acc) => acc.addressFormat === "ADDRESS_FORMAT_ETHEREUM"
      );

      if (ethereumAccount && client) {
        const turnkeyAccount = await createAccount({
          client: client as any,
          organizationId: suborgId,
          signWith: ethereumAccount.address
        });

        console.log({ turnkeyAccount });
      }
    })();
  }, [accounts, client, suborgId]);

  console.log({
    authIframeClient,
    user,
    suborgId,
    accounts,
    selectedAccount,
    client
  });

  if (user) {
    return (
      <div>
        <h1>Welcome, {user.email}</h1>
        <button
          onClick={() => {
            turnkey?.logoutUser().then(() => {
              setUser(null);
            });
          }}
        >
          Logout
        </button>
      </div>
    );
  }

  const config: ComponentProps<typeof Auth> = {
    authConfig: {
      emailEnabled: true,
      passkeyEnabled: false,
      phoneEnabled: false,
      appleEnabled: false,
      facebookEnabled: false,
      googleEnabled: false
    },
    configOrder: ["email"],
    async onAuthSuccess() {
      if (turnkey) {
        const user = await turnkey.getCurrentUser();
        const client = await turnkey?.currentUserSession();
        const session = await turnkey?.getReadWriteSession();

        console.log({ user, client, session });
        setUser(user);
      }
    },
    onError(errorMessage) {
      console.error(errorMessage);
    }
  };

  return (
    <div>
      <Auth {...config} />
    </div>
  );
}
