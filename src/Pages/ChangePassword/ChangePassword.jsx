import React, { Fragment, Suspense, lazy } from "react";
import MasterLayout from "../../Components/MasterLayout/MasterLayout";
import LazyLoader from "../../Components/MasterLayout/LazyLoader";
import PasswordChange from "../../Components/ChangePassword/PasswordChange";




const ChangePassword = () => {
  return (
    <Fragment>
      <MasterLayout>
        <Suspense fallback={<LazyLoader />}>
         <PasswordChange/>
        </Suspense>
      </MasterLayout>
    </Fragment>
  );
};

export default ChangePassword;
