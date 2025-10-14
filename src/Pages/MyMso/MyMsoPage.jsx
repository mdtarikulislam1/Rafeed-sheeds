import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";

const MyMso = lazy(() => import("../../Components/MyMso/MyMso"));
const MyMsoPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
        <MyMso/>
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default MyMsoPage;
