
import { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const CreateBudzet = lazy(() => import("../../Components/Budzet/CreateBudzet"));


const CreateBudzetPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
        <CreateBudzet/>
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default CreateBudzetPage;
