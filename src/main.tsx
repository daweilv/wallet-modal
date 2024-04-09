import React from "react";
import { createRoot } from "react-dom/client";
import {
  createTheme,
  StyledEngineProvider,
  ThemeProvider,
} from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

import App from "./App.tsx";
import "./index.css";
import WalletModalProvider from "./components/WalletModal/Provider.tsx";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);

const theme = createTheme({
  components: {
    MuiPopover: {
      defaultProps: {
        container: rootElement,
      },
    },
    MuiPopper: {
      defaultProps: {
        container: rootElement,
      },
    },
    MuiDialog: {
      defaultProps: {
        container: rootElement,
      },
    },
    MuiModal: {
      defaultProps: {
        container: rootElement,
      },
    },
  },
});

root.render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <WalletModalProvider>
          <CssBaseline />
          <App />
        </WalletModalProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  </React.StrictMode>,
);
