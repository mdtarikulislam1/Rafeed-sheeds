import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import loadingStore from "../../Zustand/LoadingStore";
import { ErrorToast } from "../../Helper/FormHelper";
import api from "../../Helper/Axios_Response_Interceptor";

export default function SearchByDealerOfficers() {
  // dealer state
  const [dealers, setDealers] = useState([]);
  const [search, setSearch] = useState("");
  // officers state
  const [officers, setOfficers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();
  const { setGlobalLoader } = loadingStore();

  // ✅ Fetch Officers
  const fetchData = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/userList`);
      if (res.data.status === "Success") {
        setOfficers(res.data.data);
        setFiltered(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching officers:", error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Officer input filter
  const handleInputChange = (value) => {
    setInputValue(value);
    if (value.trim() === "") {
      setFiltered(officers);
    } else {
      const search = value.toLowerCase();
      const result = officers.filter(
        (o) =>
          o.name?.toLowerCase().includes(search) ||
          o.mobile?.toLowerCase().includes(search) ||
          o.role?.toLowerCase().includes(search)
      );
      setFiltered(result);
    }
  };

  // ✅ Officer select handler
  const handleSelect = (selectedOfficer) => {
    if (!selectedOfficer) return;
    const id = selectedOfficer._id;
    const role = selectedOfficer.role;
    if (role === "ASM") navigate(`/ASMReport/${id}`);
    else if (role === "MSO") navigate(`/MSOReport/${id}`);
    else if (role === "RSM") navigate(`/RSMReport/${id}`);
    else ErrorToast("No report page assigned for this role!");
  };

  // ✅ Dealer Fetch
  const fetchDealers = async (query = "") => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/DealerList/1/20/${query || 0}`);

      if (res.data.status === "Success") {
        const formatted = res.data.data.map((d) => ({
          label: `${d.name} (${d.mobile}) - ${d.address}`,
          value: d._id,
          ...d,
        }));
        setDealers(formatted);
      } else {
        setDealers([]);
        ErrorToast("Failed to fetch dealers");
      }
    } catch (error) {
      console.error(error);
      ErrorToast("Something went wrong");
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  // ✅ Dealer typing handler (debounce)
  const dealerhandleInputChange = (inputValue, { action }) => {
    if (action === "input-change") {
      setSearch(inputValue);
      if (inputValue.trim().length === 0) {
        fetchDealers();
      } else {
        clearTimeout(window.dealerSearchTimeout);
        window.dealerSearchTimeout = setTimeout(() => {
          fetchDealers(inputValue);
        }, 500);
      }
    }
  };

  // ✅ Dealer select
  const dealerhandleSelect = (dealer) => {
    if (dealer) navigate(`/DealerReport/${dealer.value}`);
  };

  return (
    <div className="w-full mt-5">
      {/* <h2 className="global_heading mb-5 text-center">
        🔍 Search by Officer or Dealer
      </h2> */}

      {/* 🧩 GRID Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* Officers */}
        <div>
          {/* <h3 className="font-semibold text-gray-700 mb-2">
            👮 Search Officers
          </h3> */}
          <Select
            options={filtered}
            value={null}
            onChange={handleSelect}
            onInputChange={handleInputChange}
            inputValue={inputValue}
            placeholder="Search by officers"
            classNamePrefix="react-select"
            isClearable
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            getOptionLabel={(option) =>
              `${option.name} (${option.role}) — ${option.mobile}`
            }
            getOptionValue={(option) => option._id}
            noOptionsMessage={() => {
              if (inputValue) {
                ErrorToast("No matching officers found 😔");
                return "No matching officers found 😔";
              }
              return "Type to search officers...";
            }}
          />
        </div>

        {/* Dealers */}
        <div>
          {/* <h3 className="font-semibold text-gray-700 mb-2">
            🏪 Search Dealers
          </h3> */}
          <Select
            options={dealers}
            onChange={dealerhandleSelect}
            onInputChange={dealerhandleInputChange}
            placeholder="Search dealer"
            classNamePrefix="react-select"
            isClearable
            filterOption={null}
            noOptionsMessage={() => "No dealers found"}
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
        </div>
      </div>
    </div>
  );
}
