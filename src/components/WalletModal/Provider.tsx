import { WalletContext } from "./Context.tsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import unisatIcon from "./assets/unisat.png";
import okxIcon from "./assets/okx.png";
import bitgetIcon from "./assets/bitget.jpg";
import wizzIcon from "./assets/wizz.png";

declare global {
  interface Window {
    unisat?: never;
    wizz?: never;
    okxwallet: {
      bitcoin: never;
    };
    bitkeep: {
      unisat: never;
    };
  }
}

const Provider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wallets, setWallets] = useState([
    {
      id: "unisat",
      name: "UniSat Wallet",
      iconUrl: unisatIcon,
      installed: false,
      check: () => !!window.unisat,
      getClient: () => window.unisat,
    },
    {
      id: "okx",
      name: "OKX Wallet",
      iconUrl: okxIcon,
      installed: false,
      check: () => !!window.okxwallet?.bitcoin,
      getClient: () => window.okxwallet?.bitcoin,
    },
    {
      id: "bitget",
      name: "Bitget Wallet",
      iconUrl: bitgetIcon,
      installed: false,
      check: () => !!window.bitkeep?.unisat,
      getClient: () => window.bitkeep?.unisat,
    },
    {
      id: "wizz",
      name: "Wizz Wallet",
      iconUrl: wizzIcon,
      installed: false,
      check: () => !!window.wizz,
      getClient: () => window.wizz,
    },
  ]);
  const [connected, setConnected] = useState(false);
  const [currentWalletId, setCurrentWalletId] = useState();
  const [accounts, setAccounts] = useState<string[]>([]);
  const [publicKey, setPublicKey] = useState("");
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState({
    confirmed: 0,
    unconfirmed: 0,
    total: 0,
  });
  const [network, setNetwork] = useState("livenet");

  useEffect(() => {
    setWallets(prevState =>
      prevState
        .map(wallet => ({
          ...wallet,
          installed: wallet.check(),
        }))
        .sort((a, b) =>
          a.installed === b.installed ? 0 : a.installed ? -1 : 1,
        ),
    );
  }, []);

  const updateConnect = useCallback(state => {
    setConnected(state);
  }, []);

  const updateModal = useCallback(state => {
    setIsModalOpen(state);
  }, []);

  const updateCurrentWalletId = useCallback(state => {
    setCurrentWalletId(state);
  }, []);

  const client = useMemo((): any | undefined => {
    console.log("client change", currentWalletId);
    const wallet = wallets.find(o => o.id === currentWalletId);
    if (wallet) {
      return wallet.getClient();
    }
  }, [currentWalletId, wallets]);

  const getBasicInfo = useCallback(async () => {
    if (!client) return;
    console.log("getBasicInfo");

    const [address] = await client.getAccounts();
    setAddress(address);

    const publicKey = await client.getPublicKey();
    setPublicKey(publicKey);

    const balance = await client.getBalance();
    setBalance(balance);

    const network = await client.getNetwork();
    setNetwork(network);
  }, [client]);

  const handleAccountsChanged = useCallback(
    (_accounts: string[]) => {
      console.log("handleAccountsChanged", _accounts);
      // if (self.accounts[0] === _accounts[0]) {
      //   // prevent from triggering twice
      //   return;
      // }
      // self.accounts = _accounts;
      if (_accounts.length > 0) {
        setAccounts(_accounts);
        setConnected(true);

        setAddress(_accounts[0]);

        getBasicInfo();
      } else {
        setConnected(false);
      }
    },
    [getBasicInfo],
  );

  const handleNetworkChanged = useCallback(
    (network: string) => {
      console.log("handleNetworkChanged", network);

      setNetwork(network);
      getBasicInfo();
    },
    [getBasicInfo],
  );

  useEffect(() => {
    if (!client) return;
    console.log("client change bind event");
    client.on("accountsChanged", handleAccountsChanged);
    client.on("networkChanged", handleNetworkChanged);
    return () => {
      client.removeListener("accountsChanged", handleAccountsChanged);
      client.removeListener("networkChanged", handleNetworkChanged);
    };
  }, [client, handleAccountsChanged, handleNetworkChanged]);

  useEffect(() => {
    if (!client) return;
    console.log("client change requestAccounts");

    client.requestAccounts().then(result => {
      handleAccountsChanged(result);
    });
  }, [client, handleAccountsChanged]);

  const requestAccounts = useCallback(async () => {
    if (!client) return;
    const result = await client.requestAccounts();
    handleAccountsChanged(result);
  }, [client, handleAccountsChanged]);

  const disconnect = useCallback(async () => {
    setCurrentWalletId(undefined);
    setConnected(false);
    setAccounts([]);
    setPublicKey("");
    setAddress("");
    setBalance({
      confirmed: 0,
      unconfirmed: 0,
      total: 0,
    });

    if (client) {
      client.removeListener("accountsChanged", handleAccountsChanged);
      client.removeListener("networkChanged", handleNetworkChanged);
    }
  }, [client, handleAccountsChanged, handleNetworkChanged]);

  const contextValue = useMemo(
    () => ({
      connected,
      disconnect,
      updateConnect,
      client,
      wallets,
      accounts,
      publicKey,
      address,
      balance,
      network,
      isModalOpen,
      updateModal,
      updateCurrentWalletId,
      requestAccounts,
    }),
    [
      connected,
      disconnect,
      updateConnect,
      client,
      wallets,
      accounts,
      publicKey,
      address,
      balance,
      network,
      isModalOpen,
      updateModal,
      updateCurrentWalletId,
      requestAccounts,
    ],
  );

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

export default Provider;
