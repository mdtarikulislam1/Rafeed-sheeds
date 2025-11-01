import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useParams } from "react-router-dom";
import loadingStore from "../../Zustand/LoadingStore";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { getDateRange } from "../../Helper/dateRangeHelper";

const SaleReport = () => {
  const { id } = useParams();
  const { setGlobalLoader } = loadingStore();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateInitialized, setDateInitialized] = useState(false);
  const [selectedRange, setSelectedRange] = useState("This Year");

  // data state
  const [reportData, setReportData] = useState([]);
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

    // ✅ শুধু YYYY-MM-DD পাঠানো হবে
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
      const { data } = await axios.get(
        `${BaseURL}/SaleReport/${id}/0/${start}/${end}`,
        {
          headers: { token: getToken() },
        }
      );
      if (data?.status === "Success") {
        setReportData(data?.data || []);

        const allMatchedUsers = data?.data
          ?.flatMap((item) => item.matchedUsers || []) 
          .flat(); 

        setMatchedUsers(allMatchedUsers);

        const allMatchedDealers = data?.data
          ?.flatMap((item) => item.matchedDealers || []) 
          .flat(); 

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

  return (
    <div className="my-5 px-2">
      <div className="flex flex-col lg:flex-row items-start justify-between no-print ">
        <div className="flex items-end mb-4">
          <select
                value={selectedRange} // 🔥 এখন React control করবে value
            onChange={(e) => {
              const value = e.target.value;
              setSelectedRange(value); // 🔥 selectedRange আপডেট
              const { start, end } = getDateRange(value);
              setStartDate(start);
              setEndDate(end);
            }}
            className="global_dropdown"
          >
            {[
              "Custom",
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

      {/* data table */}

      {/* categogy table */}
      <div className="w-full overflow-auto">
        <h4 className="global_heading">Category Summary</h4>
        <table className="global_table">
          <thead className="global_thead">
            <tr className="global_tr">
              <th className="global_th ">no</th>
              <th className="global_th ">Category Name</th>
              <th className="global_th ">Total Sale</th>
              <th className="global_th ">total Weight</th>
              <th className="global_th ">count</th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {reportData && reportData.length > 0 ? (
              reportData.map((items, index) => (
                <tr key={index} className="global_tr">
                  <td className="global_td">{index + 1}</td>
                  <td className="global_td">{items?.CategoryName || "N/A"}</td>
                  <td className="global_td">{items?.TotalSale || 0}</td>
                  <td className="global_td">{items?.totalWeight || 0}</td>
                  <td className="global_td">{items?.count || 0}</td>
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
      </div>

      {/*  */}
      <div className="w-full overflow-auto">
        <h4 className="global_heading">Matched Users</h4>
        <table className="global_table">
          <thead className="global_thead">
            <tr className="global_tr">
              <th className="global_th ">no</th>
              <th className="global_th ">Name</th>
              <th className="global_th ">Mobile</th>
              <th className="global_th ">role</th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {matchedUsers && matchedUsers.length > 0 ? (
              matchedUsers.map((item, index) => (
                <tr className="global_tr" key={index}>
                  <td className="global_td">{index + 1}</td>
                  <td className="global_td">{item?.name ? item?.name : 'N/A'}</td>
                  <td className="global_td">{item?.mobile ? item?.mobile : 'N/A'}</td>
                  <td className="global_td">{item?.role ? item?.role : 'N/A'}</td>
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

      {/*  */}
      <div className="w-full overflow-auto">
        <h4 className="global_heading">Matched Dealers</h4>
        <table className="global_table">
          <thead className="global_thead">
            <tr className="global_tr">
              <th className="global_th ">no</th>
              <th className="global_th ">Name</th>
              <th className="global_th ">address</th>
              <th className="global_th ">proprietor</th>
              <th className="global_th ">mobile</th>
              <th className="global_th ">ID</th>
              <th className="global_th ">totalBalance</th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {matchedDealers && matchedDealers.length > 0 ? (
              matchedDealers.map((item, index) => (
                <tr className="global_tr" key={item._id}>
                  <td className="global_td">{index + 1}</td>
                  <td className="global_td">{item.name || 'N/A'}</td>
                  <td className="global_td">{item.address || 'N/A'}</td>
                  <td className="global_td">{item.proprietor || 'N/A'}</td>
                  <td className="global_td">{item.mobile || 'N/A'}</td>
                  <td className="global_td">{item.ID || 'N/A'}</td>
                  <td className="global_td">{item.totalBalance || 0}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-3 text-gray-500">
                  No Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SaleReport;
