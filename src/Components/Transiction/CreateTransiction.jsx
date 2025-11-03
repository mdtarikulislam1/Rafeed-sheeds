import React, { useState, useEffect } from "react";
import Select from "react-select";
import loadingStore from "../../Zustand/LoadingStore";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import api from "../../Helper/Axios_Response_Interceptor";

export default function CreateTransiction() {
  const { setGlobalLoader } = loadingStore();

  const [searchDealerKeyword, setSearchDealerKeyword] = useState("");
  const [dealers, setDealers] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedDealer, setSelectedDealer] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [credit, setCredit] = useState(0);
  const [debit, setDebit] = useState("");
  const [note, setNote] = useState("");

  // ✅ Fetch Dealers
  const fetchDealers = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(
        `/DealerList/1/20/${searchDealerKeyword || 0}`
      );

      if (res.data.status === "Success") {
        setDealers(
          res.data.data.map((d) => ({
            value: d._id,
            label: `${d.name} | ${d.proprietor} | ${d.ID}`,
            ...d,
            RSMID: d.RSMID || "",
            ASMID: d.ASMID || "",
            MSOID: d.MSOID || "",
            totalBalance: d.totalBalance || 0,
            CreatedDate: d.CreatedDate || d.createdAt,
          }))
        );
      } else {
        ErrorToast("Failed to fetch dealers");
      }
    } catch (err) {
      console.error(err);
      ErrorToast("Error fetching dealers");
    } finally {
      setGlobalLoader(false);
    }
  };

  // ✅ Fetch Categories
  const fetchCategories = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/GetCategory`);

      if (res.data.status === "Success") {
        setCategories(
          res.data.data.map((c) => ({
            value: c._id,
            label: c.name,
          }))
        );
      } else {
        ErrorToast("Failed to fetch categories");
      }
    } catch (err) {
      console.error(err);
      ErrorToast("Error fetching categories");
    } finally {
      setGlobalLoader(false);
    }
  };

  // 🔁 Auto fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // 🔍 Refetch dealer when search keyword changes
  useEffect(() => {
    if (searchDealerKeyword.length > 2 || searchDealerKeyword === "")
      fetchDealers();
  }, [searchDealerKeyword]);

  // ✅ Submit Transaction
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDealer) return ErrorToast("Please select a dealer");
    if (!selectedCategory) return ErrorToast("Please select a category");
    if (!debit && !credit) return ErrorToast("Please enter Debit or Credit");

    const data = {
      DealerID: selectedDealer.value,
      CategoryID: selectedCategory.value,
      RSMID: selectedDealer.RSMID,
      ASMID: selectedDealer.ASMID,
      MSOID: selectedDealer.MSOID,
      Credit: Number(credit) || 0,
      Debit: Number(debit) || 0,
      note,
      CreatedDate: new Date().toISOString(),
    };

    try {
      setGlobalLoader(true);
      const res = await api.post(`/CreateTransaction`, data);

      if (res.data.status === "Success") {
        SuccessToast("Transaction created successfully!");
        // reset form
        setSelectedDealer(null);
        setSelectedCategory(null);
        setCredit(0);
        setDebit(0);
        setNote("");
      } else {
        ErrorToast(res.data.message || "Failed to create transaction");
      }
    } catch (err) {
      console.error(err);
      ErrorToast("Error creating transaction");
    } finally {
      setGlobalLoader(false);
    }
  };

  return (
    <div className="global_container">
      <div className="global_sub_container">
        <h3 className="text-lg font-semibold mb-4">Create Transaction</h3>

        <div className="space-y-4">
          {/* Dealer */}
          <div>
            <label className="block text-sm font-medium mb-1">Dealer *</label>
            <Select
              options={dealers}
              value={selectedDealer}
              onChange={setSelectedDealer}
              onInputChange={(val) => setSearchDealerKeyword(val)}
              placeholder="Select Dealer"
              formatOptionLabel={(option) => (
                <div>
                  <span className="font-medium">{option.name}</span>
                  <div className="text-xs text-gray-500">
                    {option.proprietor} | ID: {option.ID}
                  </div>
                  <div className="text-xs text-red-500">
                    Balance : {option.totalBalance} 
                  </div>
                </div>
              )}
              classNamePrefix="react-select"
              className="w-full"
              menuPortalTarget={document.body}
              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <Select
              options={categories}
              value={selectedCategory}
              onChange={setSelectedCategory}
              placeholder="Select Category"
              classNamePrefix="react-select"
              className="w-full"
              menuPortalTarget={document.body}
              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            />
          </div>

       

          {/* Debit */}
          <div>
            <label className="block text-sm font-medium mb-1">Payment</label>
            <input
              type="number"
              className="global_input"
              value={debit}
              onChange={(e) => setDebit(e.target.value)}
              placeholder="Enter Amount"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium mb-1">Note</label>
            <textarea
              className="global_input"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write a note..."
            ></textarea>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="global_button w-full mt-4"
          >
            Submit Transaction
          </button>
        </div>
      </div>
    </div>
  );
}
