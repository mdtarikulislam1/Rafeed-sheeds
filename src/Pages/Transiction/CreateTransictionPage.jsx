import React, { Fragment, lazy, Suspense } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
const CreateTransiction = lazy(() =>
  import("../../Components/Transiction/CreateTransiction")
);
const CreateTransictionPage = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
          <CreateTransiction />
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default CreateTransictionPage;
