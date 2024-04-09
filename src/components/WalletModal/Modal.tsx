import {
  Avatar,
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from "@mui/material";

const Modal = props => {
  const { onClose, open, onWalletSelected, wallets } = props;

  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>Connect a Wallet</DialogTitle>
      <List sx={{ pt: 0 }}>
        {wallets.map(wallet => (
          <ListItem disableGutters key={wallet.name}>
            <ListItemButton
              onClick={() => onWalletSelected(wallet.id)}
              disabled={!wallet.installed}
            >
              <ListItemAvatar>
                <Avatar src={wallet.iconUrl} />
              </ListItemAvatar>
              <ListItemText primary={wallet.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
};

export default Modal;
