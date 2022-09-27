import '../styles/globals.css'
import {SuietWalletAdapter} from "@suiet/wallet-adapter";
import {WalletProvider} from "@mysten/wallet-adapter-react";
const supportedWallets = [
  {
    adapter: new SuietWalletAdapter(),
  },
];

function MyApp({ Component, pageProps }) {
  return (
    <WalletProvider supportedWallets={supportedWallets}>
      <Component {...pageProps} />
    </WalletProvider>
  )
}

export default MyApp
