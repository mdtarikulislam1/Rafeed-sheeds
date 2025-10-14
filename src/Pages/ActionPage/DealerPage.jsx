import { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const Dealer = lazy(() => import("../../Components/Action/Dealer"));

const DealerPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <Dealer />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default DealerPage;
