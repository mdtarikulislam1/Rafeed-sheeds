import React, { useEffect, useState } from "react";

import { ErrorToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import { FaCalendarAlt } from "react-icons/fa";
import { createPortal } from "react-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import { getDateRange } from "../../Helper/dateRangeHelper";
import api from "../../Helper/Axios_Response_Interceptor";

const AsmDashBoardPage = () => {
  const { setGlobalLoader } = loadingStore();
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [productWeightSummary, setProductWeightSummary] = useState([]);
  const [msoSummary, setMsoSummary] = useState([]);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateInitialized, setDateInitialized] = useState(false);
  const [selectedRange, setSelectedRange] = useState("This Year");

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
      const { data } = await api.get(`/ASMReport/0/${start}/${end}`);
      setSalesByCategory(data?.salesByCategory);
      setProductWeightSummary(data?.productWeightSummary);
      setMsoSummary(data?.msoSummary);
    } catch (error) {
      ErrorToast(error.message);
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
  }, [startDate, endDate]);

  const pieColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  // ---------- RENDER ----------

  return (
    <div className="p-1">
      {/* Date Filter */}
      <div className="flex flex-col lg:flex-row justify-between">
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

        <div className="flex gap-4 mb-4 items-end">
          <div>
            <label className="block text-sm">Start Date</label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt />
              </div>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="dd-MM-yyyy"
                className="global_input pl-10 w-full"
                popperPlacement="bottom-start"
                popperClassName="z-[9999]"
                calendarClassName="react-datepicker-custom"
                popperContainer={(props) =>
                  createPortal(<div {...props} />, document.body)
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm">End Date</label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt />
              </div>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="dd-MM-yyyy"
                className="global_input pl-10 w-full"
                popperPlacement="bottom-start"
                popperClassName="z-[9999]"
                calendarClassName="react-datepicker-custom"
                popperContainer={(props) =>
                  createPortal(<div {...props} />, document.body)
                }
              />
            </div>
          </div>
        </div>
      </div>
      {/* ---------- SIMPLE SUMMARY CARDS And pie ---------- */}
      <div className="flex flex-col lg:flex-row gap-2">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 flex-1">
          {salesByCategory.map((s, i) => (
            <div
              key={i}
              className="rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
            >
              <div className="px-5 py-1 text-center text-lg font-semibold text-white bg-green-500">
                {s.CategoryName}
              </div>
              <div className="p-2 space-y-3">
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-xs ">Total Sales:</span>
                  <span className="text-lg font-bold text-green-600">
                    {(s?.totalSale || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs ">Discount</span>
                  <span className="text-sm font-medium text-red-500">
                    {s.totalDiscount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs ">Grand Total</span>
                  <span className="text-sm font-medium text-green-700">
                    {s.totalGrand.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* rsm Distribution Pie Chart */}
        <div className=" rounded-xl shadow-md border border-gray-200 w-full lg:w-80 flex-shrink-0">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={salesByCategory}
                cx="45%"
                cy="50%"
                outerRadius={60}
                dataKey="totalSale"
                nameKey="CategoryName"
                label={({ name, percent, midAngle, cx, cy, outerRadius }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = outerRadius + 10;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);

                  return (
                    <text
                      x={x}
                      y={y}
                      fontSize={12}
                      textAnchor={x > cx ? "start" : "end"}
                      dominantBaseline="central"
                      className="fill-gray-800 dark:fill-gray-200" // ✅ light/dark mode
                    >
                      {`${name} ${(percent * 100).toFixed(1)}%`}
                    </text>
                  );
                }}
                labelLine={false}
              >
                {salesByCategory.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={pieColors[index % pieColors.length]}
                  />
                ))}
              </Pie>

              <Tooltip formatter={(value) => value} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Data Rendering */}

      <div className="flex flex-col gap-2 mt-5">
        {/* Mso Summary */}
        <div className="w-full overflow-auto">
          <h4 className="global_heading">Mso Summary</h4>
          <table className="global_table">
            <thead className="global_thead">
              <tr className="global_tr">
                <th className="global_th">No</th>
                <th className="global_th">MSO Name</th>
                <th className="global_th">MSO Mobile</th>
                <th className="global_th">total Sale</th>
                <th className="global_th">total Discount</th>
                <th className="global_th">total Debit</th>
                {/* <th className="global_th">total Credit</th> */}
                <th className="global_th">total Grand</th>
                <th className="global_th">action</th>
              </tr>
            </thead>

            <tbody className="global_tbody">
              {msoSummary && msoSummary.length > 0 ? (
                msoSummary.map((items, index) => (
                  <tr key={index} className="global_tr">
                    <td className="global_td">{index + 1}</td>
                    <td className="global_td">{items?.MSOName || "N/A"}</td>
                    <td className="global_td">{items?.MSOMobile || "N/A"}</td>
                    <td className="global_td">
                      {(items?.totalSale || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="global_td">
                      {(items?.totalDiscount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="global_td">
                      {(items?.totalDebit || 0).toLocaleString("en-IN")}
                    </td>
                    {/* <td className="global_td">
                      {(items?.totalCredit || 0).toLocaleString("en-IN")}
                    </td> */}
                    <td className="global_td">
                      {(items?.totalGrand || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="global_td space-x-2">
                      <Link
                        className="global_button"
                        to={`/MSOReport/${items?.MSOID}`}
                      >
                        Report
                      </Link>
                      <Link
                        className="global_button_red"
                        to={`/DealerList/${items?.MSOID}`}
                      >
                        Dealer
                      </Link>
                     
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-3 text-gray-500">
                    No Data Found
                  </td>
                </tr>
              )}
            </tbody>

            {/* ✅ Table Footer Totals */}
            {msoSummary && msoSummary.length > 0 && (
              <tfoot className="text-green-700">
                <tr className="global_tr">
                  <td className="global_td text-center">Total</td>
                  <td className="global_td text-center"></td>
                  <td className="global_td text-center"></td>
                  <td className="global_td">
                    {msoSummary
                      .reduce((sum, item) => sum + (item.totalSale || 0), 0)
                      .toLocaleString("en-IN")}
                  </td>
                  <td className="global_td">
                    {msoSummary
                      .reduce((sum, item) => sum + (item.totalDiscount || 0), 0)
                      .toLocaleString("en-IN")}
                  </td>
                  <td className="global_td">
                    {msoSummary
                      .reduce((sum, item) => sum + (item.totalDebit || 0), 0)
                      .toLocaleString("en-IN")}
                  </td>
                  {/* <td className="global_td">
                    {msoSummary
                      .reduce((sum, item) => sum + (item.totalCredit || 0), 0)
                      .toLocaleString("en-IN")}
                  </td> */}
                  <td className="global_td">
                    {msoSummary
                      .reduce((sum, item) => sum + (item.totalGrand || 0), 0)
                      .toLocaleString("en-IN")}
                  </td>
                  <td className="global_td text-center"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* product Weight summary */}
        <div className="w-full overflow-auto">
          <h4 className="global_heading">Product weight Summary</h4>
          <table className="global_table">
            <thead className="global_thead">
              <tr className="global_tr">
                <th className="global_th">No</th>
                <th className="global_th">product Name</th>
                <th className="global_th">total Weight</th>
                <th className="global_th">total Qty Sold</th>
                <th className="global_th">total Amount</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {productWeightSummary && productWeightSummary.length > 0 ? (
                productWeightSummary.map((items, index) => (
                  <tr key={index} className="global_tr">
                    <td className="global_td">{index + 1}</td>
                    <td className="global_td">{items?.productName || "N/A"}</td>
                    <td className="global_td">{items?.totalWeight || 0}</td>
                    <td className="global_td">{items?.totalQtySold || 0}</td>
                    <td className="global_td">
                      {(items?.totalAmount || 0).toLocaleString("en-IN")}
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

            {/* ✅ Table Footer Totals */}
            {productWeightSummary && productWeightSummary.length > 0 && (
              <tfoot className="text-green-700">
                <tr className="global_tr">
                  <td className="global_td text-center">Total</td>
                  <td className="global_td text-center"></td>
                  <td className="global_td">
                    {productWeightSummary.reduce(
                      (sum, item) => sum + (item.totalWeight || 0),
                      0
                    )}
                  </td>
                  <td className="global_td">
                    {productWeightSummary.reduce(
                      (sum, item) => sum + (item.totalQtySold || 0),
                      0
                    )}
                  </td>
                  <td className="global_td">
                    {productWeightSummary
                      .reduce((sum, item) => sum + (item.totalAmount || 0), 0)
                      .toLocaleString("en-IN")}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default AsmDashBoardPage;
