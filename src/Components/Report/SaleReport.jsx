import React, { useEffect, useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useParams } from "react-router-dom";
import loadingStore from "../../Zustand/LoadingStore";
import { getDateRange } from "../../Helper/dateRangeHelper";
import api from "../../Helper/Axios_Response_Interceptor";

const SaleReport = () => {
  const { id } = useParams();
  const { setGlobalLoader } = loadingStore();

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateInitialized, setDateInitialized] = useState(false);
  const [selectedRange, setSelectedRange] = useState("This Year");
  const [selectedSort, setSelectedSort] = useState("0");

  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [matchedUsers, setMatchedUsers] = useState([]);
  const [matchedDealers, setMatchedDealers] = useState([]);

  const formatDate = (date, endOfDay = false) => {
    if (!date) return null;
    const d = new Date(date);
    if (endOfDay) d.setHours(23, 59, 59, 999);
    else d.setHours(0, 0, 0, 0);

    const bdOffset = 6 * 60; // Bangladesh +6
    const utc = d.getTime() + d.getTimezoneOffset() * 60000;
    const bdTime = new Date(utc + bdOffset * 60000);

    const yyyy = bdTime.getFullYear();
    const mm = String(bdTime.getMonth() + 1).padStart(2, "0");
    const dd = String(bdTime.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
  };

  const fetchData = async () => {
    if (!startDate || !endDate) return;
    const start = formatDate(startDate, false);
    const end = formatDate(endDate, true);

    try {
      setGlobalLoader(true);
      const { data } = await api.get(
        `/SaleReport/${id}/0/${start}/${end}`
      );

      if (data?.status === "Success") {
        const allData = data?.data || [];
        setReportData(allData);
        setFilteredData(allData);

        const allMatchedUsers = allData.flatMap((i) => i.matchedUsers || []).flat();
        setMatchedUsers(allMatchedUsers);

        const allMatchedDealers = allData.flatMap((i) => i.matchedDealers || []).flat();
        setMatchedDealers(allMatchedDealers);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    const { start, end } = getDateRange("This Year");
    setStartDate(start);
    setEndDate(end);
    setSelectedRange("This Year");
    setDateInitialized(true);
  }, []);

  useEffect(() => {
    if (dateInitialized) {
      fetchData();
    }
  }, [startDate, endDate, id, dateInitialized]);

  // ✅ FILTERING (Category অনুযায়ী সব table আপডেট হবে)
  useEffect(() => {
    if (selectedSort === "0") {
      // All
      setFilteredData(reportData);
      setMatchedUsers(reportData.flatMap((i) => i.matchedUsers || []).flat());
      setMatchedDealers(reportData.flatMap((i) => i.matchedDealers || []).flat());
    } else {
      const selected = reportData.find((item) => item.CategoryName === selectedSort);
      if (selected) {
        setFilteredData([selected]);
        setMatchedUsers(selected.matchedUsers?.flat() || []);
        setMatchedDealers(selected.matchedDealers || []);
      } else {
        setFilteredData([]);
        setMatchedUsers([]);
        setMatchedDealers([]);
      }
    }
  }, [selectedSort, reportData]);

  return (
    <div className="my-5 px-2">
      {/* Date Range Filter */}
      <div className="flex flex-col lg:flex-row items-start justify-between no-print ">
        <div className="flex items-end mb-4">
          <select
            value={selectedRange}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedRange(value);
              const { start, end } = getDateRange(value);
              setStartDate(start);
              setEndDate(end);
            }}
            className="global_dropdown"
          >
            {[
              "Custom",
              "Today",
              "Last 30 Days",
              "This Week",
              "Last Week",
              "This Month",
              "Last Month",
              "This Year",
              "Last Year",
            ].map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4 mb-8">
          {/* Start Date */}
          <div>
            <label className="block text-sm">Start Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt />
              </div>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="dd-MM-yyyy"
                className="global_input pl-10"
              />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm">End Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt />
              </div>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="dd-MM-yyyy"
                className="global_input pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="w-full flex justify-end items-end">
        <select
          className="global_dropdown max-w-40"
          value={selectedSort}
          onChange={(e) => setSelectedSort(e.target.value)}
        >
          <option value="0">All</option>
          {reportData &&
            reportData.length > 0 &&
            reportData.map((items, index) => (
              <option key={index} value={items?.CategoryName}>
                {items?.CategoryName}
              </option>
            ))}
        </select>
      </div>

      {/* Category Summary Table */}
      <div className="w-full overflow-auto">
        <h4 className="global_heading">Category Summary</h4>
        <table className="global_table">
          <thead className="global_thead">
            <tr className="global_tr">
              <th className="global_th">no</th>
              <th className="global_th">Category Name</th>
              <th className="global_th">Total Sale</th>
              <th className="global_th">Total Weight</th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {filteredData.length > 0 ? (
              filteredData.map((items, index) => (
                <tr key={index} className="global_tr">
                  <td className="global_td">{index + 1}</td>
                  <td className="global_td">{items?.CategoryName || "N/A"}</td>
                  <td className="global_td">{items?.TotalSale || 0}</td>
                  <td className="global_td">
                    {(() => {
                      const weight = items?.totalWeight || 0;
                      const kg = Math.floor(weight / 1000);
                      const gram = weight % 1000;

                      if (weight === 0) return "0 g";
                      if (kg > 0 && gram > 0) return `${kg} kg ${gram} g`;
                      if (kg > 0) return `${kg} kg`;
                      return `${gram} g`;
                    })()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-3 text-gray-500">
                  No Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Matched Users Table */}
      {/* <div className="w-full overflow-auto">
        <h4 className="global_heading">Matched Users</h4>
        <table className="global_table">
          <thead className="global_thead">
            <tr className="global_tr">
              <th className="global_th">no</th>
              <th className="global_th">Name</th>
              <th className="global_th">Mobile</th>
              <th className="global_th">Role</th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {matchedUsers.length > 0 ? (
              matchedUsers.map((item, index) => (
                <tr className="global_tr" key={index}>
                  <td className="global_td">{index + 1}</td>
                  <td className="global_td">{item?.name || "N/A"}</td>
                  <td className="global_td">{item?.mobile || "N/A"}</td>
                  <td className="global_td">{item?.role || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-3 text-gray-500">
                  No Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div> */}

      {/* Matched Dealers Table */}
      {/* <div className="w-full overflow-auto">
        <h4 className="global_heading">Matched Dealers</h4>
        <table className="global_table">
          <thead className="global_thead">
            <tr className="global_tr">
              <th className="global_th">no</th>
              <th className="global_th">ID</th>
              <th className="global_th">Name</th>
              <th className="global_th">Address</th>
              <th className="global_th">Proprietor</th>
              <th className="global_th">Mobile</th>
              <th className="global_th">Total Balance</th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {matchedDealers.length > 0 ? (
              matchedDealers.map((item, index) => (
                <tr className="global_tr" key={item._id}>
                  <td className="global_td">{index + 1}</td>
                  <td className="global_td">{item.ID || "N/A"}</td>
                  <td className="global_td">{item.name || "N/A"}</td>
                  <td className="global_td">{item.address || "N/A"}</td>
                  <td className="global_td">{item.proprietor || "N/A"}</td>
                  <td className="global_td">{item.mobile || "N/A"}</td>
                  <td className="global_td">{item.totalBalance || 0}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-3 text-gray-500">
                  No Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div> */}
    </div>
  );
};

export default SaleReport;
