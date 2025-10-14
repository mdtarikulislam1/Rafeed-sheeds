import React, { Fragment, lazy, Suspense } from "react";
// import Dashboard from "../../Components/Dashboard/Dashboard copy";
import RsmDashBoardPage from "../../Components/Dashboard/RsmDashBoardPage";
import AsmDashBoardPage from "../../Components/Dashboard/AsmDashBoardPage";
import MsoDashBoardPage from "../../Components/Dashboard/MsoDashBoardPage";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
import { getAdmin, getRole } from "../../Helper/SessionHelper";
const Dashboard = lazy(() => import("../../Components/Dashboard/Dashboard"));


export default function MsoReportPage() {
  const role = getRole();      
  const isAdmin = getAdmin() == 1;


  const renderDashboard = () => {
    if (isAdmin) {
      return <Dashboard />;
    }

    switch (role) {
      case "RSM":
        return <RsmDashBoardPage />;
      case "ASM":
        return <AsmDashBoardPage />;
      case "MSO":
        return <MsoDashBoardPage />;
      default:
        return <div className="text-center mt-10 text-red-500">No Dashboard Found</div>;
    }
  };

  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          {renderDashboard()}
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
}
