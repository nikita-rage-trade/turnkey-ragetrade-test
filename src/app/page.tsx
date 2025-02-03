"use client";

import { Auth, useTurnkey } from "@turnkey/sdk-react";
import { ComponentProps, useEffect, useState } from "react";

export default function Home() {
  const { turnkey } = useTurnkey();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (turnkey) {
      const user = turnkey.getCurrentUser();
      setUser(user);
    }
  }, [turnkey]);

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
    onAuthSuccess() {
      console.log("Authentication successful");

      return Promise.resolve();
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
