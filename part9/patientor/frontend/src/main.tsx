import ReactDOM from "react-dom/client";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import App from "./App.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <LocalizationProvider dateAdapter={AdapterDateFns}>
    <App />
  </LocalizationProvider>
);
