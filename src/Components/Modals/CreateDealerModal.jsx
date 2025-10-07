import React, { useEffect, useState } from "react";
import openCloseStore from "../../Zustand/OpenCloseStore";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import { getToken } from "../../Helper/SessionHelper"; // make sure you have this
import { FaWallet } from "react-icons/fa"; // since you used <FaWallet />
import loadingStore from "../../Zustand/LoadingStore";

const CreateDealerModal = () => {
  const { dealerModal, setDealerModal } = openCloseStore();
  const [MSO, setMSO] = useState([]);
  const [selectedMSO, setSelectedMSO] = useState(null);
  const [selectedASM, setSelectedASM] = useState("");
  const [ASM, setASM] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setGlobalLoader } = loadingStore();

  const [form, setForm] = useState({
    name: "",
    email: "",
    proprietor: "",
    mobile: "",
    address: "",
  });

  const fetchAllData = async () => {
    try {
      await Promise.all([fetchMSO(), fetchASM()]);
    } catch (error) {
      console.error(error);
    }
  };

  // Disable background scroll when modal is open
  useEffect(() => {
    if (dealerModal) {
      document.body.classList.add("overflow-hidden");
      fetchAllData();
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [dealerModal]);

  // Fetch MSO list
  const fetchMSO = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BaseURL}/GetMSO`, {
        headers: { token: getToken() },
      });

      if (res.data.status === "Success") {
        setMSO(res.data.data);
      } else {
        ErrorToast(res.data.message);
      }
    } catch (error) {
      ErrorToast(error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  // Fetch ASM
  const fetchASM = async () => {
    try {
      setGlobalLoader(true);

      const res = await axios.get(`${BaseURL}/GetASM`, {
        headers: {
          token: getToken(),
        },
      });

      if (res.data.status === "Success") {
        setASM(res.data.data);
      } else {
        ErrorToast(res.data.message);
      }
    } catch (error) {
      ErrorToast(error.message);
      console.log(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  // Input change handler
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Reset form
  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      proprietor: "",
      mobile: "",
      address: "",
    });
    setSelectedMSO(null);
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // if (!selectedMSO || ! selectedASM) {
    //   return ErrorToast("Please select an MSO");
    // }

    try {
      setLoading(true);

      const payload = {
        name: form.name,
        email: form.email,
        proprietor: form.proprietor,
        mobile: form.mobile,
        address: form.address,

        ...(selectedASM
          ? { ASMID: selectedASM._id, RSMID: selectedASM.RSMID }
          : {}),
        ...(selectedMSO
          ? {
              ASMID: selectedMSO.ASMID,
              MSOID: selectedMSO._id,
              RSMID: selectedMSO.RSMID,
            }
          : {}),
      };

      const res = await axios.post(`${BaseURL}/adDealer`, payload, {
        headers: { token: getToken() },
      });

      if (res.data.status === "Success") {
        SuccessToast("Dealer created successfully");
        resetForm();

        setDealerModal(false); // close modal after success
      } else {
        ErrorToast(res.data.message || "Failed to create Dealer");
      }
    } catch (error) {
      ErrorToast(error.response?.data?.message || "Something went wrong");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!dealerModal) return null;

  return (
    <div
      onClick={() => setDealerModal(false)}
      className="fixed inset-0 z-50 bg-[#0000006c] flex items-center justify-center"
    >
      <div
        className="flex relative text-black dark:text-white flex-col bg-white dark:bg-[#1E2939] rounded-lg p-6 max-w-lg w-full mx-4 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <div className="flex justify-between">
          <h2 className="text-lg  font-bold mb-4">Create Dealer</h2>
          <button
            className="global_button_red"
            onClick={() => {
              setDealerModal(false);
            }}
          >
            close
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Name */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="global_input"
              required
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">Proprietor Name</label>
            <input
              type="text"
              name="proprietor"
              value={form.proprietor}
              onChange={handleChange}
              className="global_input"
            />
          </div>

          {/* Mobile */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">
              Mobile <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="global_input"
              required
            />
          </div>

          {/* select MSO */}
          {!selectedASM && (
            <div className="mb-4 col-span-3 lg:col-span-1">
              <label className="text-sm font-medium mb-1 flex items-center">
                <FaWallet className="mr-2 text-green-600" /> Select MSO
              </label>
              <select
                value={selectedMSO ? selectedMSO._id : ""}
                onChange={(e) => {
                  const mso = MSO.find((m) => m._id === e.target.value);
                  setSelectedMSO(mso || "");
                }}
                className="global_dropdown w-full"
                required
              >
                <option value="">Select MSO</option>
                {MSO.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* select ASM */}
          {!selectedMSO && (
            <div className="mb-4 col-span-3 lg:col-span-1">
              <label className="text-sm font-medium mb-1 flex items-center">
                <FaWallet className="mr-2 text-green-600" /> Select ASM
              </label>
              <select
                value={selectedASM ? selectedASM._id : ""}
                onChange={(e) => {
                  const asm = ASM.find((m) => m._id === e.target.value);
                  setSelectedASM(asm || "");
                }}
                className="global_dropdown w-full"
              >
                <option value="">Select ASM</option>
                {ASM.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Address */}
          <div className="flex flex-col md:col-span-2">
            <label className="mb-1 text-sm font-medium">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="global_input"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end md:col-span-2">
            <button type="submit" className="global_button" disabled={loading}>
              {loading ? "Creating..." : "Create Dealer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDealerModal;
