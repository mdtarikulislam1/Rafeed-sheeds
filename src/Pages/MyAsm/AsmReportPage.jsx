import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
// import AsmDetails from "../../Components/MyAsm/AsmDetails";

const AsmDetails = lazy(() => import("../../Components/MyAsm/AsmReport"));
const AsmReportPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <AsmDetails/>
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default AsmReportPage;
