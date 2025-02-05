"use client";

import { Auth, useTurnkey } from "@turnkey/sdk-react";
import { EthereumWallet } from "@turnkey/wallet-stamper";
import { ComponentProps, useEffect, useState } from "react";

export default function Home() {
  const { turnkey, client } = useTurnkey();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (turnkey) {
      turnkey.getCurrentUser().then((user) => {
        setUser(user);
      });
    }
  }, [turnkey]);

  console.log(client);

  const getAccounts = async () => {
    const client = await turnkey?.currentUserSession();

    console.log({ user, client });
  };

  if (user) {
    return (
      <div>
        <h1>Welcome, {user.email}</h1>
        <button onClick={getAccounts}>Get accounts</button>
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

        console.log({ user, client });
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
