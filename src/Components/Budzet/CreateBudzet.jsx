import React, { useEffect, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import api from "../../Helper/Axios_Response_Interceptor";

export default function CreateBudzet() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [amount, setAmount] = useState("");

  // Fetch User List
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/userList");
        if (res.data.status === "Success") {
          const options = res.data.data.map((user) => ({
            value: user._id,
            label: user.name,
          }));
          setUsers(options);
        }
      } catch (err) {
        console.error("User fetch failed:", err);
      }
    };
    fetchUsers();
  }, []);

  //  Format Date to YYYY-MM-DD
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  //  SweetAlert Toast
  const showToast = (icon, title) => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon,
      title,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
  };

  //  Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUser || !startDate || !endDate || !amount) {
      showToast("error", "Please fill all fields!");
      return;
    }

    const payload = {
      userID: selectedUser.value,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      amount: Number(amount),
    };

    try {
      const res = await api.post("/AddBudget", payload);
      if (res.data.status === "Success") {
        showToast("success", "Budget added successfully!");
        setSelectedUser(null);
        setStartDate(null);
        setEndDate(null);
        setAmount("");
        console.log(res)
      } else {
        showToast("error", res.data.message || "Something went wrong!");
      }
    } catch (err) {
      console.error("Budget post failed:", err);
      showToast("error", "Server error!");
    }
  };

  return (
    <div className="global_container py-5 px-2">
      <div className="global_sub_container">
        <h2 className="global_heading">Create Budget</h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-center">
            {/* User Select */}
            <div className="lg:col-span-2">
              <label className="block mb-1 font-medium">Select User</label>
              <Select
                options={users}
                value={selectedUser}
                onChange={(val) => {
                  setSelectedUser(val);
                  if (!val) {
                    setAmount("");
                    setStartDate(null);
                    setEndDate(null);
                  }
                }}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  control: (base) => ({
                    ...base,
                    minHeight: "42px",
                    borderRadius: "8px",
                    borderColor: "#d1d5db",
                  }),
                }}
                menuPortalTarget={document.body}
                placeholder="Choose a user..."
                isClearable
                classNamePrefix="react-select"
              />
            </div>

            {/* Amount */}
            <div className="col-span-1">
              <label className="block mb-1 font-medium">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="global_input w-full"
                placeholder="Enter budget amount"
                disabled={!selectedUser}
              />
            </div>

            {/* Start Date */}
            <div className="col-span-1">
              <label className="block mb-1 font-medium">Start Date</label>
              <div className="w-full">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  className="global_input block !w-full"
                  popperPlacement="bottom-start"
                  popperClassName="z-[9999]"
                  wrapperClassName="w-full block"
                  placeholderText="Select start date"
                  dateFormat="yyyy-MM-dd"
                  disabled={!selectedUser}
                />
              </div>
            </div>

            {/* End Date */}
            <div className="col-span-1">
              <label className="block mb-1 font-medium">End Date</label>
              <div className="w-full">
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  className="global_input w-full"
                  popperPlacement="bottom-start"
                  popperClassName="z-[9999]"
                  placeholderText="Select end date"
                  dateFormat="yyyy-MM-dd"
                  disabled={!selectedUser}
                  wrapperClassName="w-full block"
                />
              </div>
            </div>
          </div>

        <div className="flex w-full justify-end items-end">
            <button type="submit" className="global_button mt-4">
            Submit
          </button>
        </div>
        </form>
      </div>
    </div>
  );
}
