import { Fragment } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { getToken } from "./Helper/SessionHelper";
import Login from "./Components/Login/Login";
import DashboardPage from "./Pages/Dashboard/DashboardPage";
import BusinessSettingPage from "./Pages/BusinessSetting/BusinessSettingPage";
import ProductListPage from "./Pages/Product/ProductListPage";
import CreateCategoryPage from "./Pages/Product/CategoryPage";
import AllUserPage from "./Pages/Team/AllUserPage";
import RolePage from "./Pages/Team/RolePage";
import PermissionPage from "./Pages/Team/PermissionPage";
import AccountPage from "./Pages/Accounts/AccountPage";
import DealerPage from "./Pages/Contact/DealerPage";
import SupplierPage from "./Pages/Contact/SupplierPage";
import NewSalePage from "./Pages/Sale/NewSalePage";
import SaleListPage from "./Pages/Sale/SaleListPage";
import SaleReturnListPage from "./Pages/Sale/SaleReturnListPage";
import PurchaseListPage from "./Pages/Purchase/PurchaseListPage";
import CreatePurchasePage from "./Pages/Purchase/CreatePurchasePage";
import MSOPage from "./Pages/Team/MSOPage";
import RSMPage from "./Pages/Team/RSMPage";
import ASMPage from "./Pages/Team/ASMPage";
import ViewMSOPage from "./Pages/Team/ViewMSOPage";
import DealerListPage from "./Pages/Contact/DealerListPage";
import ViewASMPage from "./Pages/Team/ViewASMPage";
import ExpensePage from "./Pages/Expense/ExpensePage";
import ExpenseTypePage from "./Pages/Expense/ExpenseTypePage";
import PurchaseDetailsPage from "./Pages/Purchase/PurchaseDetailsPage";
import SaleDetailsPage from "./Pages/Sale/SaleDetailsPage";
import ViewDealerLaserPage from "./Pages/Contact/ViewDealerLaserPage";
import ViewSupplierLaserPage from "./Pages/Contact/ViewSupplierLaserPage";
import MyDealerPage from "./Pages/Officers/MyDealerPage";
import SellListPage from "./Pages/Officers/SellListPage";
import PostTransictionPage from "./Pages/Officers/PostTransictionPage";
import TransictionListPage from "./Pages/Officers/TransictionListPage";
import AllTransictionListPage from "./Pages/Transiction/AllTransictionListPage";
import TransictionDetailsPage from "./Pages/Transiction/TransictionDetailsPage";
import AddStockPage from "./Pages/Product/AddStockPage";
import AddStockDetailsPage from "./Pages/Product/AddStockDetailsPage";
import AddStockListPage from "./Pages/Product/AddStockListPage";
import ChangePassword from "./Pages/ChangePassword/ChangePassword";
import MyAsmPage from "./Pages/MyAsm/MyAsmPage";
import AsmDetailsPage from "./Pages/MyAsm/AsmReportPage";
import MyDealerPages from "./Pages/MyAsm/MyDealerPage";
import AsmPage from "./Pages/Dashboard/ActionPage/AsmPage";
import RsmReportPage from "./Pages/Dashboard/ActionPage/RsmReportPage";
import MsoListPage from "./Pages/Dashboard/ActionPage/MsoListPage";

function App() {
  const isLoggedIn = getToken();

  return (
    <Fragment>
      <BrowserRouter>
        {isLoggedIn ? (
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/BusinessSetting" element={<BusinessSettingPage />} />
            <Route path="/ProductList" element={<ProductListPage />} />
            <Route path="/Category" element={<CreateCategoryPage />} />
            <Route path="/AddStock" element={<AddStockPage />} />
            <Route
              path="/AddStockDetails/:id"
              element={<AddStockDetailsPage />}
            />
            <Route path="/AddStockList" element={<AddStockListPage />} />
            <Route path="/AllUser" element={<AllUserPage />} />
            <Route path="/Role" element={<RolePage />} />
            <Route path="/Permission/:id" element={<PermissionPage />} />
            <Route path="/BankAccount" element={<AccountPage />} />
            <Route path="/Dealer" element={<DealerPage />} />
            <Route path="/Supplier" element={<SupplierPage />} />
            <Route
              path="/ViewDealerLaser/:id"
              element={<ViewDealerLaserPage />}
            />
            <Route
              path="/ViewSupplierLaser/:id"
              element={<ViewSupplierLaserPage />}
            />

            <Route path="/Expense" element={<ExpensePage />} />
            <Route path="/ExpenseType" element={<ExpenseTypePage />} />

            <Route path="/NewSale" element={<NewSalePage />} />
            <Route path="/SaleList" element={<SaleListPage />} />
            <Route path="/SaleDetails/:id" element={<SaleDetailsPage />} />
            <Route path="/SaleReturnList" element={<SaleReturnListPage />} />

            <Route path="/PurchaseList" element={<PurchaseListPage />} />
            <Route
              path="/PurchaseDetails/:id"
              element={<PurchaseDetailsPage />}
            />
            <Route path="/CreatePurchase" element={<CreatePurchasePage />} />
            <Route path="/MSO" element={<MSOPage />} />
            <Route path="/RSM" element={<RSMPage />} />
            <Route path="/ASM" element={<ASMPage />} />
            <Route path="/ViewMSO/:id" element={<ViewMSOPage />} />
            <Route path="/ViewASM/:id" element={<ViewASMPage />} />
            <Route path="/DealerList/:id" element={<DealerListPage />} />
            <Route path="/MyDealer" element={<MyDealerPage />} />
            <Route path="/SellList" element={<SellListPage />} />
            <Route path="/PostTransiction" element={<PostTransictionPage />} />
            <Route path="/TransictionList" element={<TransictionListPage />} />
            <Route path="/changePassword" element={<ChangePassword/>}/>
            <Route path="/MyAsmPage" element={<MyAsmPage/>}/>
            <Route path="/details/by/asm/:id" element={<AsmDetailsPage/>}/>
     
            <Route path="/my/dealer" element={<MyDealerPages/>}/>

            {/* Dashboard action */}
            <Route path="/rsm/report/:id" element={<RsmReportPage/>}/>
            <Route path="/GetASMbyRSM/:id" element={<AsmPage/>}/>
            <Route path="/MSOByASM/:id" element={<MsoListPage/>}/>
            <Route path="/dashBoard/DealerPage:id" element={<DealerPage/>}/>
          


            <Route
              path="/AllTransictionList"
              element={<AllTransictionListPage />}
            />
            <Route
              path="/TransictionDetails/:id"
              element={<TransictionDetailsPage />}
            />
          </Routes>
        ) : (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </BrowserRouter>
    </Fragment>
  );
}

export default App;
