import React, { useEffect, useRef, useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useParams } from "react-router-dom";
import loadingStore from "../../Zustand/LoadingStore";
import { useDownloadStore } from "../../Helper/Download-xlsx";
import { getDateRange } from "../../Helper/dateRangeHelper";
import api from "../../Helper/Axios_Response_Interceptor";

const AsmReport = () => {
  const { id } = useParams();
  const { setGlobalLoader } = loadingStore();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateInitialized, setDateInitialized] = useState(false);
  const [selectedRange, setSelectedRange] = useState("This Year");

  // data state
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [productWeightSummary, setProductWeightSummary] = useState([]);
  const [totalData, setTotalData] = useState([]);

  // download xlsx
  const { downloadSelected } = useDownloadStore();
  const containerRef = useRef(null);

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
      const { data } = await api.get(
        `/MSOReport/${id}/${start}/${end}`
        
      );

      if (data?.status === "success") {
        setProductWeightSummary(data?.productWeightSummary || []);
        setSalesByCategory(data?.salesByCategory || []);
        setTotalData(data?.MSO || []);
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
    <div className="my-5 px-2" ref={containerRef}>
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

      {/* user Data */}

      <div>
        {totalData?.MSOName ? (
          <h4 className="user-name">Name: {totalData?.MSOName}</h4>
        ) : (
          ""
        )}
        {totalData?.MSOMobile ? (
          <p className="user-mobile">Mobile: {totalData?.MSOMobile}</p>
        ) : (
          ""
        )}
      </div>

      {/* salesByCategory */}
      <div className="w-full overflow-auto">
        <h4 className="global_heading ">Sales By Category</h4>
        <table className="global_table">
          <thead className="global_thead">
            <tr className="global_tr">
              <th className="global_th">No</th>
              <th className="global_th">Category Name</th>
              <th className="global_th">total Sale</th>
              <th className="global_th">total Discount</th>
              <th className="global_th">total Grand</th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {salesByCategory && salesByCategory.length > 0 ? (
              salesByCategory.map((items, index) => (
                <tr key={index} className="global_tr">
                  <td className="global_td">{index + 1}</td>
                  <td className="global_td">{items?.CategoryName || "N/A"}</td>
                  <td className="global_td">
                    {(items?.totalSale || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="global_td">
                    {(items?.totalDiscount || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="global_td">
                    {(items?.totalGrand || 0).toLocaleString("en-IN")}
                  </td>
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
          {salesByCategory && salesByCategory.length > 0 && (
            <tfoot className="text-green-700 no-download">
              <tr className="global_tr">
                <td className="global_td text-center">Total</td>
                <td className="global_td text-center"></td>
                <td className="global_td">
                  {salesByCategory
                    .reduce((sum, item) => sum + (item.totalSale || 0), 0)
                    .toLocaleString("en-IN")}
                </td>
                <td className="global_td">
                  {salesByCategory.reduce(
                    (sum, item) =>
                      sum + (item.totalDiscount || 0),
                    0
                  ).toLocaleString("en-IN")}
                </td>
                <td className="global_td">
                  {salesByCategory.reduce(
                    (sum, item) =>
                      sum + (item.totalGrand || 0),
                    0
                  ).toLocaleString("en-IN")}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* productWeightSummary */}
      <div className="w-full overflow-auto">
        <h4 className="global_heading">Product Weight Summary</h4>
        <table className="global_table">
          <thead className="global_thead">
            <tr className="global_tr">
              <th className="global_th">No</th>
              <th className="global_th">product Name</th>
              <th className="global_th">total amount</th>
              <th className="global_th">total Weight</th>
              <th className="global_th">total Qty</th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {productWeightSummary && productWeightSummary.length > 0 ? (
              productWeightSummary.map((items, index) => (
                <tr key={index} className="global_tr">
                  <td className="global_td">{index + 1}</td>
                  <td className="global_td">{items?.productName || "N/A"}</td>
                  <td className="global_td">{(items?.totalAmount || 0).toLocaleString("en-IN")}</td>
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
                  <td className="global_td">{items?.totalQtySold || 0}</td>
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
          {productWeightSummary && productWeightSummary.length > 0 && (
            <tfoot className="text-green-700">
              <tr className="global_tr">
                <td className="global_td text-center">Total</td>
                <td className="global_td text-center"></td>
                <td className="global_td">
                  {productWeightSummary.reduce(
                    (sum, item) => sum + (item.totalAmount || 0),
                    0
                  ).toLocaleString("en-IN")}
                </td>
                <td className="global_td">
                  {(() => {
                    const totalWeight = productWeightSummary.reduce(
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
                  {productWeightSummary.reduce(
                    (sum, item) => sum + (item.totalQtySold || 0),
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

export default AsmReport;
