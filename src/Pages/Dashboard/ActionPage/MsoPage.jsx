import React, { Fragment, Suspense, lazy } from "react";
import MasterLayout from "../../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../../Components/MasterLayout/LazyLoader";
const Mso = lazy(() => import("../../../Components/Dashboard/Action/Mso"));

const MsoPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
         <Mso/>
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default MsoPage;
