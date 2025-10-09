import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";

const MsoTable = lazy(() => import("../../Components/MyMso/MsoTable"));
const MyMsoPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
         <MsoTable/>
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default MyMsoPage;
