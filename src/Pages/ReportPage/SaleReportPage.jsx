import { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";

const SaleReport = lazy(() =>
  import("../../Components/Report/SaleReport")
);

const SaleReportPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          {/* <AddStockReport /> */}
          <SaleReport />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default SaleReportPage;
