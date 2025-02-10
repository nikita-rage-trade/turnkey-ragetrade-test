"use client";

import { Auth, useTurnkey } from "@turnkey/sdk-react";
import { ComponentProps, useEffect, useState } from "react";

export default function Home() {
  const { turnkey, authIframeClient } = useTurnkey();
  const [user, setUser] = useState<any>(null);
  const [suborgId, setSuborgId] = useState("");
  const [wallets, setWallets] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (turnkey) {
        const session = await turnkey.getReadWriteSession();

        if (!session || Date.now() > session!.expiry) {
          await turnkey.logoutUser();
          return;
        }

        await authIframeClient?.injectCredentialBundle(
          session.credentialBundle
        );

        const whoami = await authIframeClient?.getWhoami();
        const suborgId = whoami?.organizationId;
        setSuborgId(suborgId!);

        console.log({ suborgId });

        const userResponse = await authIframeClient!.getUser({
          organizationId: suborgId!,
          userId: whoami?.userId!
        });

        setUser(userResponse.user);

        console.log({ userResponse });

        const walletsResponse = await authIframeClient!.getWallets({
          organizationId: suborgId!
        });

        setWallets(walletsResponse.wallets);

        if (walletsResponse.wallets.length > 0) {
          const defaultWalletId = walletsResponse.wallets[0].walletId;
          setSelectedWallet(defaultWalletId);

          const accountsResponse = await authIframeClient!.getWalletAccounts({
            organizationId: suborgId!,
            walletId: defaultWalletId
          });
          setAccounts(accountsResponse.accounts);
          if (accountsResponse.accounts.length > 0) {
            setSelectedAccount(accountsResponse.accounts[0].address);
          }
        }
      }
    })();
  }, [turnkey]);

  console.log(
    user,
    suborgId,
    wallets,
    accounts,
    selectedAccount,
    selectedWallet
  );

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
