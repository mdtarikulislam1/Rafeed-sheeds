import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import loadingStore from "../../Zustand/LoadingStore";
import { ErrorToast } from "../../Helper/FormHelper";
import api from "../../Helper/Axios_Response_Interceptor";

export default function SearchAsmMsoByRsm() {
  // ASM state
  const [asmList, setAsmList] = useState([]);
  const [filteredAsm, setFilteredAsm] = useState([]);
  const [asmInput, setAsmInput] = useState("");

  // MSO state
  const [msoList, setMsoList] = useState([]);
  const [filteredMso, setFilteredMso] = useState([]);
  const [msoInput, setMsoInput] = useState("");

  const navigate = useNavigate();
  const { setGlobalLoader } = loadingStore();

  // ✅ Fetch ASM Data
  const fetchAsm = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/ASM/0`);
      if (res.data.status === "Success") {
        setAsmList(res.data.data);
        setFilteredAsm(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching ASM:", error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchAsm();
  }, []);

  // ✅ ASM input filter
  const handleAsmInputChange = (value) => {
    setAsmInput(value);
    if (value.trim() === "") {
      setFilteredAsm(asmList);
    } else {
      const search = value.toLowerCase();
      const result = asmList.filter(
        (o) =>
          o.name?.toLowerCase().includes(search) ||
          o.mobile?.toLowerCase().includes(search) ||
          o.role?.toLowerCase().includes(search)
      );
      setFilteredAsm(result);
    }
  };

  // ✅ ASM select handler
  const handleAsmSelect = (selected) => {
    if (!selected) return;
    navigate(`/ASMReport/${selected._id}`);
  };

  // ✅ Fetch MSO Data (only once)
  const fetchMso = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/MSO/0/`);
      if (res.data.status === "Success") {
        const formatted = res.data.data.map((m) => ({
          label: `${m.name} (${m.mobile})`,
          value: m._id,
          ...m,
        }));
        setMsoList(formatted);
        setFilteredMso(formatted);
      } else {
        setMsoList([]);
        setFilteredMso([]);
        ErrorToast("Failed to fetch MSO data");
      }
    } catch (error) {
      console.error("Error fetching MSO:", error);
      ErrorToast("Something went wrong");
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    fetchMso();
  }, []);

  // ✅ MSO input filter (frontend only)
  const handleMsoInputChange = (inputValue, { action }) => {
    if (action === "input-change") {
      setMsoInput(inputValue);
      if (inputValue.trim() === "") {
        setFilteredMso(msoList);
      } else {
        const search = inputValue.toLowerCase();
        const filtered = msoList.filter(
          (m) =>
            m.name.toLowerCase().includes(search) ||
            m.mobile.includes(inputValue)
        );
        setFilteredMso(filtered);
      }
    }
  };

  // ✅ MSO select handler
  const handleMsoSelect = (mso) => {
    if (mso) navigate(`/MSOReport/${mso.value}`);
  };

  return (
    <div className="w-full mt-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* ASM Search */}
        <div>
          <Select
            options={filteredAsm}
            value={null}
            onChange={handleAsmSelect}
            onInputChange={handleAsmInputChange}
            inputValue={asmInput}
            placeholder="Search ASM..."
            classNamePrefix="react-select"
            isClearable
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            getOptionLabel={(option) =>
              `${option.name} (${option.role}) — ${option.mobile}`
            }
            getOptionValue={(option) => option._id}
            noOptionsMessage={() =>
              asmInput ? "No matching ASM found 😔" : "Type to search ASM..."
            }
          />
        </div>

        {/* MSO Search */}
        <div>
          <Select
            options={filteredMso}
            value={null}
            onChange={handleMsoSelect}
            onInputChange={handleMsoInputChange}
            inputValue={msoInput}
            placeholder="Search MSO..."
            classNamePrefix="react-select"
            isClearable
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            noOptionsMessage={() =>
              msoInput ? "No matching MSO found 😔" : "Type to search MSO..."
            }
          />
        </div>
      </div>
    </div>
  );
}
