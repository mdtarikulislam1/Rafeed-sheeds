import { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const RsmReport = lazy(() => import("../../Components/Action/RsmReport"));

const RsmReportPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <RsmReport />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default RsmReportPage;
