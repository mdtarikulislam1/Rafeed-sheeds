import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link, useParams } from "react-router-dom";
import loadingStore from "../../Zustand/LoadingStore";
import { getToken } from "../../Helper/SessionHelper";
import { BaseURL } from "../../Helper/Config";
import { useDownloadStore } from "../../Helper/Download-xlsx";
import { getDateRange } from "../../Helper/dateRangeHelper";

const DealerReport = () => {
  const { id } = useParams();
  const { setGlobalLoader } = loadingStore();
  const [reportData, setReportData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateInitialized, setDateInitialized] = useState(false);
  const [selectedRange, setSelectedRange] = useState("This Year");

  // download
  const containerRef = useRef();
  const { downloadSelected } = useDownloadStore();



  const formatDate = (date, endOfDay = false) => {
    const d = new Date(date);
    if (endOfDay) d.setHours(23, 59, 59, 999);
    else d.setHours(0, 0, 0, 0);

    const bdOffset = 6 * 60;
    const utc = d.getTime() + d.getTimezoneOffset() * 60000;
    const bdTime = new Date(utc + bdOffset * 60000);
    return bdTime.toISOString();
  };

  const fetchData = async () => {
    if (!startDate || !endDate) return;

    const start = formatDate(startDate, false);
    const end = formatDate(endDate, true);

    try {
      setGlobalLoader(true);
      const { data } = await axios.get(
        `${BaseURL}/DealerReport/${id}/${start}/${end}`,
        {
          headers: { token: getToken() },
        }
      );

      if (data?.status === "Success") {
        setReportData(data?.data);
        console.log(data?.data);
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
  }, [startDate, endDate, dateInitialized]);

  return (
    <div className="my-5 px-2 " ref={containerRef}>
      <div className="flex flex-col lg:flex-row items-start justify-between no-print">
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

      {/* user data */}

      <div>
        {reportData?.dealerName ? (
          <h4 className="user-name">Name: {reportData?.dealerName}</h4>
        ) : (
          ""
        )}
        {reportData?.dealerMobile ? (
          <p className="user-mobile">Mobile: {reportData?.dealerMobile}</p>
        ) : (
          ""
        )}
        {reportData?.dealerAddress ? (
          <address className="user-mobile">Address: {reportData?.dealerAddress}</address>
        ) : (
          ""
        )}
      </div>

      {/* dealer summary */}


      {/* summary */}
      <div className="w-full overflow-auto">
        <h4 className="global_heading">Product summary</h4>
        <table className="global_table">
          <thead className="global_thead">
            <tr className="global_tr">
              <th className="global_th">no</th>
              <th className="global_th">category Name</th>
              <th className="global_th">product name</th>
              <th className="global_th">per price</th>
              <th className="global_th">qtySold</th>
              <th className="global_th">per weight</th>
              <th className="global_th">total Weight</th>
              <th className="global_th">total amount</th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {reportData?.products && reportData?.products?.length > 0 ? (
              reportData?.products?.map((items, index) => (
                <tr key={index} className="global_tr">
                  <td className="global_td">{index + 1}</td>
                  <td className="global_td">{items?.categoryName || "N/A"}</td>
                  <td className="global_td">{items?.name || "N/A"}</td>
                  <td className="global_td">{items?.price || "N/A"}</td>
                  <td className="global_td">{items?.qtySold || 0}</td>
                  <td className="global_td">
                    {(() => {
                      const weight = items?.weight || 0;
                      const kg = Math.floor(weight / 1000);
                      const gram = weight % 1000;

                      if (weight === 0) return "0 g";
                      if (kg > 0 && gram > 0) return `${kg} kg ${gram} g`;
                      if (kg > 0) return `${kg} kg`;
                      return `${gram} g`;
                    })()}
                  </td>
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
                  <td className="global_td">{items?.total || 0}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-3 text-gray-500">
                  No Data Found
                </td>
              </tr>
            )}
          </tbody>

          {/* ✅ Table Footer Totals */}
          {reportData?.products && reportData?.products?.length > 0 && (
            <tfoot className="text-green-700">
              <tr className="global_tr">
                <td className="global_td text-center">Total</td>
                <td className="global_td text-center"></td>
                <td className="global_td text-center"></td>
                <td className="global_td text-center"></td>
                {/* <td className="global_td">
                  {reportData?.products?.reduce(
                    (sum, item) => sum + (item.price || 0),
                    0
                  )}
                </td> */}
                <td className="global_td">
                  {reportData?.products?.reduce(
                    (sum, item) => sum + (item.qtySold || 0),
                    0
                  )}
                </td>
                <td className="global_td text-center"></td>
                <td className="global_td">
                  {(() => {
                    const totalWeight = reportData?.products?.reduce(
                      (sum, item) => sum + (item.totalWeight || 0),
                      0
                    );

                    const kg = Math.floor(totalWeight / 1000);
                    const gram = totalWeight % 1000;

                    if (totalWeight === 0) return "0 g";
                    if (kg > 0 && gram > 0) return `${kg} kg ${gram} g`;
                    if (kg > 0) return `${kg} kg`;
                    return `${gram} g`;
                  })()}
                </td>
                <td className="global_td">
                  {reportData?.products?.reduce(
                    (sum, item) => sum + (item.total || 0),
                    0
                  )}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <button
        className="global_button cursor-pointer no-print mt-6"
        onClick={() => window.print()}
      >
        Print
      </button>
      <button
        className="global_button cursor-pointer no-print mx-3"
        onClick={() => downloadSelected(containerRef, "report")}
      >
        Download Excel
      </button>
    </div>
  );
};

export default DealerReport;
