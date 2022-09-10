import logo from "./logo.svg";
import "./App.css";
import { WalletProvider, useWallet } from "@mysten/wallet-adapter-react";
import { SuietWalletAdapter } from "suiet-wallet-adapter";
import { useEffect, useState } from "react";

const supportedWallets = [
  {
    adapter: new SuietWalletAdapter(),
  },
];

function WalletSelector(props) {
  const { value, supportedWallets, onChange } = props;
  return (
    <select value={value} onChange={onChange}>
      <option value={""} disabled>
        please select a wallet
      </option>
      {supportedWallets.map((wallet) => {
        return (
          <option key={wallet.adapter.name} value={wallet.adapter.name}>
            {wallet.adapter.name}
          </option>
        );
      })}
    </select>
  );
}

function Page() {
  const {
    select,
    wallet,
    connected,
    connecting,
    disconnect,
    getAccounts,
    executeMoveCall,
  } = useWallet();
  const [walletName, setWalletName] = useState("");
  const [accounts, setAccounts] = useState([]);

  function handleConnect() {
    console.log("select", walletName);
    select(walletName);
  }

  function handleDisconnect() {
    console.log("disconnect", walletName);
    setWalletName("");
    disconnect();
  }

  async function handleExecuteMoveCall() {
    await executeMoveCall({
      packageObjectId: "0x2",
      module: "devnet_nft",
      function: "mint",
      typeArguments: [],
      arguments: [
        "name",
        "capy",
        "https://cdn.britannica.com/94/194294-138-B2CF7780/overview-capybara.jpg?w=800&h=450&c=crop",
      ],
      gasBudget: 10000,
    });
  }

  // useEffect(() => {
  //   if (!wallet) return;
  //   if (wallet.adapter && !walletName) {
  //     setWalletName(wallet.adapter.name);
  //   }
  // }, [wallet]);

  useEffect(() => {
    if (!walletName) return;
    if (connected) {
      (async function () {
        const result = await getAccounts();
        setAccounts(result);
      })();
    }
  }, [walletName, connected]);

  return (
    <div className="App">
      <section className="container">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Suiet Wallet Adapter Playground</h1>
        <p>Start editing to see some magic happen!</p>
        <div>
          <WalletSelector
            supportedWallets={supportedWallets}
            value={walletName}
            onChange={(evt) => setWalletName(evt.target.value)}
          />
          <button
            style={{ margin: "0px 4px" }}
            disabled={!walletName}
            onClick={() => {
              if (!connected) handleConnect();
              else handleDisconnect();
            }}
          >
            {connecting ? "connecting" : connected ? "Disconnect" : "connect"}
          </button>

          {connected && (
            <div style={{ margin: "8px 0" }}>
              <button onClick={handleExecuteMoveCall}>executeMoveCall</button>
            </div>
          )}
        </div>
        <div>
          <p>current wallet: {wallet ? wallet.adapter.name : "null"}</p>
          <p>
            wallet status:{" "}
            {connecting
              ? "connecting"
              : connected
              ? "connected"
              : "disconnected"}
          </p>
          <p>wallet accounts: {JSON.stringify(accounts)}</p>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  return (
    <WalletProvider supportedWallets={supportedWallets}>
      <Page />
    </WalletProvider>
  );
}
