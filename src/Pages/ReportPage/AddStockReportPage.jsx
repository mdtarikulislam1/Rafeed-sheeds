
import { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const AddStockReport = lazy(() =>
  import("../../Components/Report/AddStockReport")
);

const AddStockReportPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <AddStockReport />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default AddStockReportPage;
