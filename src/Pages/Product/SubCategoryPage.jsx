import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const ViewSubCategory = lazy(() => import("../../Components/Product/ViewSubCategory"));


const SubCategoryPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
         <ViewSubCategory/>
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default SubCategoryPage;
