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
import SearchAsmMsoByRsm from "./SearchAsmMsoByRsm";

const RsmDashBoardPage = () => {
  const { setGlobalLoader } = loadingStore();
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [productWeightSummary, setProductWeightSummary] = useState([]);
  const [asmSummary, setAsmSummary] = useState([]);
  const [msoSummary, setMsoSummary] = useState([]);

  // new state for filter
  const [selectedCategory, setSelectedCategory] = useState("0");

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
      const { data } = await api.get(`/RSMReport/0/${start}/${end}`);
      setSalesByCategory(data?.salesByCategory);
      setProductWeightSummary(data?.productWeightSummary);
      setAsmSummary(data?.asmSummary);
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

  const filteredweight =
    selectedCategory === "0"
      ? productWeightSummary
      : productWeightSummary.filter(
          (item) => item.CategoryName === selectedCategory
        );

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
          {salesByCategory.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            >
              {/* Header */}
              <div className="px-5 py-2 text-center text-lg font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700">
                {s.CategoryName}
              </div>

              {/* Body */}
              <div className="p-4 space-y-4">
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Total Sales:
                  </span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    {s?.totalSale || 0}
                  </span>
                </div>

                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Discount:
                  </span>
                  <span className="text-sm font-medium text-red-500 dark:text-red-400">
                    {s.totalDiscount}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Grand Total:
                  </span>
                  <span className="text-lg font-semibold text-green-700 dark:text-green-400">
                    {s.totalGrand}
                  </span>
                </div>
              </div>

              {/* Hover accent */}
              <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-500 dark:from-green-500 dark:to-emerald-600 transition-all duration-300 opacity-0 hover:opacity-100" />
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

      {/* filter select */}

      <div className="flex w-full justify-end items-end  my-10">
        <select
          className="global_dropdown min-w-40 max-w-48"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="0">All</option>
          {salesByCategory.map((items, index) => (
            <option key={index} value={items?.CategoryName}>
              {items?.CategoryName}
            </option>
          ))}
        </select>
      </div>

      <SearchAsmMsoByRsm/>

      {/* product Weight summary */}
      <div className="w-full overflow-auto">
        <h4 className="global_heading">Product weight Summary</h4>
        <table className="global_table">
          <thead className="global_thead">
            <tr className="global_tr">
              <th className="global_th">No</th>
              <th className="global_th">Category Name</th>
              <th className="global_th">product Name</th>
              <th className="global_th">total Weight</th>
              <th className="global_th">total Qty Sold</th>
              <th className="global_th">total Amount</th>
            </tr>
          </thead>

          <tbody className="global_tbody">
            {filteredweight && filteredweight.length > 0 ? (
              filteredweight.map((items, index) => (
                <tr key={index} className="global_tr">
                  <td className="global_td">{index + 1}</td>
                  <td className="global_td">{items?.CategoryName || "N/A"}</td>
                  <td className="global_td">{items?.productName || "N/A"}</td>
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
                  <td className="global_td">
                    {(items?.totalAmount || 0).toLocaleString("en-IN")}
                  </td>
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
          {filteredweight && filteredweight.length > 0 && (
            <tfoot className="text-green-700">
              <tr className="global_tr">
                <td className="global_td text-center">Total</td>
                <td className="global_td text-center"></td>
                <td className="global_td text-center"></td>
                <td className="global_td">
                  {(() => {
                    const totalWeight = filteredweight.reduce(
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
                  {filteredweight.reduce(
                    (sum, item) => sum + (item.totalQtySold || 0),
                    0
                  )}
                </td>
                <td className="global_td">
                  {filteredweight
                    .reduce((sum, item) => sum + (item.totalAmount || 0), 0)
                    .toLocaleString("en-IN")}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Summary Data Rendering */}

      <div className="flex flex-col gap-2 mt-5">
        {/* asm summary */}
        <div className="w-full overflow-auto">
          <h4 className="global_heading">ASM Summary</h4>
          <table className="global_table">
            <thead className="global_thead">
              <tr className="global_tr">
                <th className="global_th">No</th>
                <th className="global_th">ASM Name</th>
                <th className="global_th">ASM Mobile</th>
                <th className="global_th">total Sale</th>
                <th className="global_th">total Discount</th>
                <th className="global_th">total Debit</th>
                <th className="global_th">total Grand</th>
                <th className="global_th">action</th>
              </tr>
            </thead>

            <tbody className="global_tbody">
              {asmSummary && asmSummary.length > 0 ? (
                asmSummary.map((items, index) => (
                  <tr key={index} className="global_tr">
                    <td className="global_td">{index + 1}</td>
                    <td className="global_td">{items?.ASMName || "N/A"}</td>
                    <td className="global_td">{items?.ASMMobile || "N/A"}</td>
                    <td className="global_td">
                      {(items?.totalSale || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="global_td">
                      {(items?.totalDiscount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="global_td">
                      {(items?.totalDebit || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="global_td">
                      {(items?.totalGrand || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="global_td space-x-2">
                      <Link
                        to={`/ASMReport/${items?.ASMID}`}
                        className="global_button"
                      >
                        Report
                      </Link>

                      <Link
                        to={`/MSO/${items?.ASMID}`}
                        className="global_button_red"
                      >
                        MSO
                      </Link>
                      <Link
                        to={`/DealerList/${items?.ASMID}`}
                        className="global_button"
                      >
                        Dealer
                      </Link>
                     
                    </td>
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
            {asmSummary && asmSummary.length > 0 && (
              <tfoot className="text-green-700">
                <tr className="global_tr">
                  <td className="global_td text-center">Total</td>
                  <td className="global_td text-center"></td>
                  <td className="global_td text-center"></td>
                  <td className="global_td">
                    {asmSummary
                      .reduce((sum, item) => sum + (item.totalSale || 0), 0)
                      .toLocaleString("en-IN")}
                  </td>
                  <td className="global_td">
                    {asmSummary
                      .reduce((sum, item) => sum + (item.totalDiscount || 0), 0)
                      .toLocaleString("en-IN")}
                  </td>
                  <td className="global_td">
                    {asmSummary
                      .reduce((sum, item) => sum + (item.totalDebit || 0), 0)
                      .toLocaleString("en-IN")}
                  </td>
                  <td className="global_td">
                    {asmSummary
                      .reduce((sum, item) => sum + (item.totalGrand || 0), 0)
                      .toLocaleString("en-IN")}
                  </td>
                  <td className="global_td text-center"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

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
                    <td className="global_td">
                      {(items?.totalGrand || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="global_td space-x-2">
                      <Link
                        to={`/MSOReport/${items?.MSOID}`}
                        className="global_button"
                      >
                        Report
                      </Link>
                      <Link
                        to={`/DealerList/${items?.MSOID}`}
                        className="global_button"
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
      </div>
    </div>
  );
};

export default RsmDashBoardPage;
