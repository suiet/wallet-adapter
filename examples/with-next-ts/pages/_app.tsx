import '../styles/globals.css'
import type {AppProps} from 'next/app'
import {WalletProvider} from "@mysten/wallet-adapter-react";
import {WalletAdapter} from "@mysten/wallet-adapter-base";
import {SuietWalletAdapter} from "@suiet/wallet-adapter";

export const suietAdapter = new SuietWalletAdapter();
export const supportedWallets: { adapter: WalletAdapter }[] = [
  {
    adapter: suietAdapter,
  },
];

function MyApp({Component, pageProps}: AppProps) {
  return (
    <WalletProvider supportedWallets={supportedWallets}>

      <Component {...pageProps} />
    </WalletProvider>
  )
}

export default MyApp
