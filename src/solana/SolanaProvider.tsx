// src/solana/SolanaProvider.tsx
import React, { ReactNode, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

import "@solana/wallet-adapter-react-ui/styles.css";

type Props = {
  children: ReactNode;
};

export function SolanaProvider({ children }: Props) {
  const endpoint = useMemo(
    () =>
      import.meta.env.VITE_SOLANA_RPC_URL ||
      clusterApiUrl("devnet"), // change to mainnet-beta later
    []
  );

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter({ name: "Phantom Wallet" }),
      new SolflareWalletAdapter({ name: "Solflare Wallet" }),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
