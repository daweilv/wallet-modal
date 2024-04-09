import { Button } from "@mui/material";
import WalletModal from "./Modal.tsx";
import { useContext } from "react";
import { WalletContext } from "./Context.tsx";

const ConnectButton = () => {
  const {
    connected,
    disconnect,
    isModalOpen,
    updateModal,
    updateCurrentWalletId,
    wallets,
  } = useContext(WalletContext);
  return (
    <>
      <Button
        className="fixed right-4 top-4"
        variant="outlined"
        onClick={() => {
          if (connected) {
            disconnect();
          } else {
            updateModal(true);
          }
        }}
      >
        {!connected ? "Connect" : "Disconnect"}
      </Button>
      <WalletModal
        open={isModalOpen}
        onClose={() => {
          updateModal(false);
        }}
        onWalletSelected={(id: string) => {
          updateModal(false);
          updateCurrentWalletId(id);
        }}
        wallets={wallets}
      />
    </>
  );
};

export default ConnectButton;
