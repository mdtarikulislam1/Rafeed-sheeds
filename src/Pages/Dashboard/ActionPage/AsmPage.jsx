import React, { Fragment, Suspense, lazy } from "react";
import MasterLayout from "../../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../../Components/MasterLayout/LazyLoader";
const Asm = lazy(() => import("../../../Components/Dashboard/Action/Asm"));

const AsmPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
       <Asm/>
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default AsmPage;
