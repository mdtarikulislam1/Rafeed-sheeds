import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./assets/progress.css";
import "./assets/print.css";
import App from "./App.jsx";
import FullScreenLoader from "./Components/MasterLayout/FullScreenLoader.jsx";
import CreateDealerModal from "./Components/Modals/CreateDealerModal.jsx";
import CreateSupplierModal from "./Components/Modals/CreateSupplierModal.jsx";
import CreateCategoryModal from "./Components/Modals/CreateCategoryModal.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <main>
      <FullScreenLoader />
      <CreateCategoryModal />

      <CreateDealerModal />
      <CreateSupplierModal />
      <App />
    </main>
    </StrictMode> 
);
