import React, { Fragment, Suspense, lazy } from "react";
import MasterLayout from "../../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../../Components/MasterLayout/LazyLoader";
const Dealer = lazy(() => import("../../../Components/Dashboard/Action/Dealer"));

const DealerPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
        <Dealer/>
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default DealerPage;
