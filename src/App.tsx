import { useContext, useEffect, useState } from "react";
import "./App.css";
import { Button, TextField } from "@mui/material";
import ConnectButton from "./components/WalletModal/ConnectButton.tsx";
import { WalletContext } from "./components/WalletModal/Context.tsx";
import useSWR from "swr";
// @ts-ignore
const fetcher = (...args) => fetch(...args).then(res => res.json());

function App() {
  const { client, address, balance, network, connected, updateModal } =
    useContext(WalletContext);
  // console.log("address", address);
  // console.log("balance", balance);
  // console.log("network", network);
  const [toAddress, setToAddress] = useState(
    "tb1qlsf9dzkyt5zrad47jdrzk2sa5mp0376krfl7lr",
  );
  const [satoshis, setSatoshis] = useState("1000");
  const [fee, setFee] = useState("");

  // https://mempool.space/testnet/docs/api/rest#get-recommended-fees
  const { data } = useSWR(
    "https://mempool.space/api/v1/fees/recommended",
    fetcher,
  );

  useEffect(() => {
    if (fee === "" && data) {
      setFee(data.hourFee);
    }
  }, [data, fee]);

  console.log("data", data);
  const [txid, setTxid] = useState("");
  const [txConfirmed, setTxConfirmed] = useState(false);

  const { data: txData } = useSWR(
    txid ? `https://mempool.space/testnet/api/tx/${txid}` : null,
    fetcher,
    {
      refreshInterval: txConfirmed ? 0 : 60_000,
    },
  );
  useEffect(() => {
    if (!txData) return;
    setTxConfirmed(txData?.status?.confirmed);
  }, [txData]);
  console.log("txData", txData);
  return (
    <div className="h-screen relative">
      <ConnectButton />
      <div>
        <div className="mb-4">
          <div>
            <span className="font-bold">Address: </span>
            {address}
          </div>
          <div>
            <span className="font-bold">Balance(confirmed): </span>
            {balance.confirmed}
          </div>
          <div>
            <span className="font-bold">Balance(unconfirmed): </span>
            {balance.unconfirmed}
          </div>
          <div>
            <span className="font-bold">Balance(total): </span>
            {balance.total}
          </div>
          <div>
            <span className="font-bold">Network: </span>
            {network}
          </div>
        </div>
        <TextField
          fullWidth
          label="Receiver Address:"
          variant="outlined"
          value={toAddress}
          className="mb-4"
          onChange={e => setToAddress(e.target.value)}
        />
        <TextField
          fullWidth
          label="Amount: (satoshis)"
          variant="outlined"
          value={satoshis}
          className="mb-4"
          onChange={e => setSatoshis(e.target.value)}
        />
        <TextField
          fullWidth
          label="Fee Rate: "
          variant="outlined"
          value={fee}
          className="mb-4"
          onChange={e => setFee(e.target.value)}
        />
        {txid && (
          <div style={{ marginTop: 10 }}>
            <div className="font-bold">Success!</div>
            <div className="font-bold">TXID:</div>
            <div style={{ wordWrap: "break-word" }}>{txid}</div>
            <div className="font-bold">Confirmed:</div>
            <div>{txData?.status?.confirmed ? "Yes" : "No"}</div>
            <div>{txConfirmed}</div>
          </div>
        )}

        <Button
          variant="contained"
          style={{ marginTop: 10 }}
          onClick={async () => {
            if (!connected) {
              updateModal(true);
              return;
            }

            try {
              const txid = await client.sendBitcoin(
                toAddress,
                parseInt(satoshis),
                { feeRate: fee },
              );
              setTxid(txid);
            } catch (e) {
              setTxConfirmed((e as any).message);
            }
          }}
        >
          SendBitcoin
        </Button>
      </div>
    </div>
  );
}

export default App;
