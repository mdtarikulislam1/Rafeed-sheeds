import { useState } from "react";
import axios from "axios";
import { BiShow,BiHide } from "react-icons/bi";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { getToken, removeSessions } from "../../Helper/SessionHelper";
import { BaseURL } from "../../Helper/Config";
import loadingStore from "../../Zustand/LoadingStore";

export default function PasswordChange() {
  const { setGlobalLoader } = loadingStore();

  // state for show/hide passwords
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handlePasswordChange = async (e) => {
    setGlobalLoader(true);
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    try {
      const response = await axios.post(`${BaseURL}/changePassword`, data, {
        headers: { token: getToken() },
      });

      console.log(response.data);

      if (response?.data?.status === "Success") {
        SuccessToast(
          response?.data?.message || "Password changed successfully!"
        );
        removeSessions();
      } else {
        ErrorToast(response?.data?.message || "Something went wrong!");
      }
    } catch (error) {
      console.log(error);
      ErrorToast(error?.response?.data?.message || "Network or server error!");
    } finally {
      e.target.reset();
      setGlobalLoader(false);
    }
  };

  return (
    <div className="global_container">
      <h4 className="font-semibold text-lg text-center py-3">
        Change Password
      </h4>
      <form onSubmit={handlePasswordChange}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* Current Password */}
          <div className="relative">
            <label>Current Password</label>
            <input
              className="global_input pr-10"
              required
              type={showCurrent ? "text" : "password"}
              name="currentPassword"
              placeholder="Enter current password"
            />
            <span
              className="absolute right-3 top-8 cursor-pointer text-xl  text-gray-600"
              onClick={() => setShowCurrent(!showCurrent)}
            >
              {showCurrent ? <BiShow /> : <BiHide />}
            </span>
          </div>

          {/* New Password */}
          <div className="relative">
            <label>New Password</label>
            <input
              className="global_input pr-10"
              required
              type={showNew ? "text" : "password"}
              name="newPassword"
              placeholder="Enter new password"
            />
            <span
              className="absolute right-3 top-8 cursor-pointer text-xl text-gray-600"
              onClick={() => setShowNew(!showNew)}
            >
              {showNew ? <BiShow /> : <BiHide />}
            </span>
          </div>
        </div>

        <div className="my-4 flex items-end justify-end">
          <input className="global_button" type="submit" value="Submit" />
        </div>
      </form>
    </div>
  );
}
