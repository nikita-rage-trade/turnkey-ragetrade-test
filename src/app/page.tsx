"use client";

import { useEthereumWallet } from "@/ethereum-wallet/EthereumWalletProvider";
import { useSolanaWallet } from "@/solana-wallet/SolanaWalletProvider";
import { useTurnkeyWallet } from "@/turnkey/TurnkeyWalletProvider";
import { Button } from "@/ui/Button";
import { Dialog } from "@/ui/Dialog";
import { getViemChainById } from "@/wagmi/utils";
import { useWallet } from "@solana/wallet-adapter-react";
import { Auth, Export } from "@turnkey/sdk-react";
import { useState, ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { parseUnits } from "viem";
import { arbitrum, mainnet, optimism } from "viem/chains";
import { useConnect, useConnectors } from "wagmi";

const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
};

export default function Home() {
  const wagmiConnectors = useConnectors();
  const { wallets: solanaConnectors, connect: connectSolana, select } = useWallet();
  const { connectAsync } = useConnect();
  const { ethereumWallet } = useEthereumWallet();
  const { solanaWallet: solWallet } = useSolanaWallet();
  const [message, setMessage] = useState("");
  const [usdcAmount, setUsdcAmount] = useState("0");
  const [isTurnkeyOpen, setIsTurnkeyOpen] = useState(false);
  const turnkeyWallet = useTurnkeyWallet();

  if (turnkeyWallet.isLoading) {
    return <div>Loading...</div>;
  }

  const turnkeyAuthConfig: ComponentProps<typeof Auth> = {
    authConfig: {
      emailEnabled: true,
      passkeyEnabled: true,
      phoneEnabled: false,
      appleEnabled: false,
      facebookEnabled: false,
      googleEnabled: false,
    },
    configOrder: ["email", "passkey"],
    async onAuthSuccess() {
      turnkeyWallet.connect();
    },
    onError(errorMessage) {},
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="p-8 border border-gray-200 rounded-lg w-[500px]">
        {!turnkeyWallet.wallet && (
          <div className="mb-6">
            <Button
              className={twMerge("w-full mb-4", isTurnkeyOpen && "bg-purple-100")}
              onClick={() => setIsTurnkeyOpen(!isTurnkeyOpen)}
            >
              Continue with Turnkey
            </Button>

            {isTurnkeyOpen && <Auth {...turnkeyAuthConfig} />}
          </div>
        )}

        {ethereumWallet ? (
          <>
            <h2 className="mb-2 text-2xl font-semibold">Ethereum Wallet</h2>
            <div className="flex gap-2 items-center justify-between">
              <div className="flex gap-1 items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://api.dicebear.com/9.x/lorelei/svg" alt="User" className="size-6" />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(ethereumWallet.address);
                    alert("Copied to clipboard");
                  }}
                >
                  {truncateAddress(ethereumWallet.address)}
                </button>
              </div>
              <Button variant="danger" onClick={() => ethereumWallet.disconnect()}>
                Disconnect
              </Button>
            </div>

            <div className="flex flex-col mt-4">
              <h5 className="text-md font-semibold">Switch Chain</h5>
              <div className="flex gap-2">
                {[arbitrum, optimism, mainnet].map((chain) => {
                  return (
                    <Button
                      key={chain.id}
                      className="mt-2"
                      onClick={() => ethereumWallet.switchChain(chain.id)}
                      disabled={chain.id === ethereumWallet.chainId}
                    >
                      {chain.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col mt-4">
              <h5 className="text-md font-semibold">Sign a message</h5>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="border border-gray-200 rounded-lg p-2 mt-2 resize-none outline-none"
                placeholder="Message"
              />

              <Button
                className="mt-2"
                onClick={async () => {
                  const walletClient = await ethereumWallet.getWalletClient();

                  if (walletClient) {
                    const signedMessage = await walletClient.signMessage({ message } as any);
                    alert(signedMessage);
                    setMessage("");
                  }
                }}
              >
                Sign Message
              </Button>
            </div>

            <div className="flex flex-col mt-4">
              <h5 className="text-md font-semibold">Transfer USDC</h5>
              <input
                value={usdcAmount}
                onChange={(event) => setUsdcAmount(event.target.value)}
                className="border border-gray-200 rounded-lg p-2 mt-2 resize-none outline-none"
                placeholder="USDC Amount"
              />

              <Button
                className="mt-2"
                onClick={async () => {
                  const formattedAmount = Number(usdcAmount);

                  if (isNaN(formattedAmount)) {
                    alert("Invalid amount");
                    return;
                  }

                  const walletClient = await ethereumWallet.getWalletClient();

                  if (walletClient) {
                    const tx = await walletClient.writeContract({
                      abi: [
                        {
                          type: "function",
                          name: "transfer",
                          stateMutability: "nonpayable",
                          inputs: [
                            {
                              name: "recipient",
                              type: "address",
                            },
                            {
                              name: "amount",
                              type: "uint256",
                            },
                          ],
                          outputs: [
                            {
                              type: "bool",
                            },
                          ],
                        },
                      ],
                      args: ["0x0C0e6d63A7933e1C2dE16E1d5E61dB1cA802BF51", parseUnits(usdcAmount, 6)],
                      chain: getViemChainById(ethereumWallet.chainId),
                      address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
                      functionName: "transfer",
                    } as any);
                  }
                }}
              >
                Send
              </Button>
            </div>

            {turnkeyWallet.wallet?.ethereum && (
              <div className="flex flex-col mt-6">
                <Export
                  walletId={turnkeyWallet.wallet.ethereum.walletId}
                  onHandleExportSuccess={async () => {
                    console.log("Export successful");
                  }}
                  onError={() => {
                    console.log("Export failed");
                  }}
                />
              </div>
            )}
          </>
        ) : !isTurnkeyOpen ? (
          <>
            <h2 className="mb-2 text-2xl font-semibold">Ethereum Wallet</h2>
            <h5 className="text-lg font-bold">Connect Wallet</h5>
            <div className="flex flex-col gap-2 mt-4">
              {wagmiConnectors.map((connector) => {
                return (
                  <button
                    key={connector.id}
                    className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:bg-purple-100 active:bg-purple-200 cursor-pointer w-full text-center transition-colors select-none"
                    onClick={async () => connectAsync({ connector })}
                  >
                    {connector.icon && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={connector.icon} alt={connector.name} className="size-5" />
                    )}

                    {connector.name}
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        <div className="my-4" />

        {solWallet ? (
          <>
            <h2 className="mb-2 text-2xl font-semibold">Solana Wallet</h2>
            <div className="flex gap-2 items-center justify-between">
              <div className="flex gap-1 items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://api.dicebear.com/9.x/lorelei/svg" alt="User" className="size-6" />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(solWallet.address.toString());
                    alert("Copied to clipboard");
                  }}
                >
                  {truncateAddress(solWallet.address.toString())}
                </button>
              </div>
              <Button variant="danger" onClick={() => solWallet.disconnect()}>
                Disconnect
              </Button>
            </div>
          </>
        ) : !isTurnkeyOpen ? (
          <>
            <h2 className="mb-2 text-2xl font-semibold">Solana Wallet</h2>
            <h5 className="text-lg font-bold">Connect Wallet</h5>
            <div className="flex flex-col gap-2 mt-4">
              {solanaConnectors.map(({ adapter: connector }) => {
                return (
                  <button
                    key={connector.name}
                    className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:bg-purple-100 active:bg-purple-200 cursor-pointer w-full text-center transition-colors select-none"
                    onClick={async () => {
                      select(connector.name);
                      await connector.connect();
                    }}
                  >
                    {connector.icon && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={connector.icon} alt={connector.name} className="size-5" />
                    )}

                    {connector.name}
                  </button>
                );
              })}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
