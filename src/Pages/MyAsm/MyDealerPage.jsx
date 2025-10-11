import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const MyDealer = lazy(() => import("../../Components/MyAsm/MyDealer"));

const MyDealerPages = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
       <MyDealer/>
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default MyDealerPages;
