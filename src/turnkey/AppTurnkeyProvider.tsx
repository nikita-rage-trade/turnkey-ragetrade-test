"use client";
import { TurnkeyProvider } from "@turnkey/sdk-react";
import { ComponentProps, ReactNode } from "react";

interface AppTurnkeyProviderProps {
  children: ReactNode;
}

const config: ComponentProps<typeof TurnkeyProvider>["config"] = {
  apiBaseUrl: "https://api.turnkey.com",
  defaultOrganizationId: process.env.NEXT_PUBLIC_ORGANIZATION_ID as string,
  iframeUrl: "https://auth.turnkey.com",
};

export function AppTurnkeyProvider({ children }: AppTurnkeyProviderProps) {
  return <TurnkeyProvider config={config}>{children}</TurnkeyProvider>;
}
