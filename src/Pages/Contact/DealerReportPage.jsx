import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const DealerReport = lazy(() => import("../../Components/Contact/DealerReport"));

const DealerReportPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
        <DealerReport/>
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default DealerReportPage;
