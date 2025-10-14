import { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const MsoReport = lazy(() => import("../../Components/Action/MsoReport"));

const MsoReportPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <MsoReport />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default MsoReportPage;
