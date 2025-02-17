"use client";
import { TurnkeyProvider } from "@turnkey/sdk-react";
import { ReactNode } from "react";

interface AppTurnkeyProviderProps {
  children: ReactNode;
}

const config = {
  apiBaseUrl: "https://api.turnkey.com",
  defaultOrganizationId: process.env.NEXT_PUBLIC_ORGANIZATION_ID as string,
};

export function AppTurnkeyProvider({ children }: AppTurnkeyProviderProps) {
  return <TurnkeyProvider config={config}>{children}</TurnkeyProvider>;
}
