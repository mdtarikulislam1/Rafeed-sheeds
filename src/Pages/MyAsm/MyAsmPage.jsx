import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
import MyAsm from "../../Components/MyAsm/MyAsm";
const Expense = lazy(() => import("../../Components/Expense/Expense"));

const MyAsmPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <MyAsm />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default MyAsmPage;
