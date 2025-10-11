
import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";


const MsoList = lazy(() => import("../../Components/MyAsm/MsoList"));
const MsoListPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
      <MsoList/>
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default MsoListPage;
