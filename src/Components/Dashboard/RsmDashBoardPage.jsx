import React, { useEffect, useState } from "react";

import { ErrorToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { FaCalendarAlt } from "react-icons/fa";
import { createPortal } from "react-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";

const RsmDashBoardPage = () => {
  const { setGlobalLoader } = loadingStore();
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [productWeightSummary, setProductWeightSummary] = useState([]);
  const [asmSummary, setAsmSummary] = useState([]);
  const [msoSummary, setMsoSummary] = useState([]);

  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 0))
  );
  const [endDate, setEndDate] = useState(new Date());

  const formatDate = (date, endOfDay = false) => {
    const d = new Date(date);
    if (endOfDay) {
      d.setHours(23, 59, 59, 999);
    } else {
      d.setHours(0, 0, 0, 0);
    }

    const bdOffset = 6 * 60; // minutes
    const utc = d.getTime() + d.getTimezoneOffset() * 60000;
    const bdTime = new Date(utc + bdOffset * 60000);

    return bdTime.toISOString();
  };

  const fetchData = async () => {
    const start = formatDate(startDate, false); // 00:00:00
    const end = formatDate(endDate, true); // 23:59:59

    try {
      setGlobalLoader(true);
      const { data } = await axios.get(
        `${BaseURL}/RSMReport/0/${start}/${end}`,
        {
          headers: { token: getToken() },
        }
      );
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
    if (startDate && endDate) {
      fetchData();
    }
  }, [startDate, endDate]);

  // ---------- DATE RANGE HELPERS ----------
  const startOfDay = (d) => {
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const endOfDay = (d) => {
    d.setHours(23, 59, 59, 999);
    return d;
  };

  // helper: Saturday = 6
  const getDiffFromSaturday = (day) => {
    // JS: Sunday = 0 ... Saturday = 6
    return (day + 1) % 7; // Saturday → 0, Sunday → 1, Monday → 2 ... Friday → 6
  };

  const getDateRange = (option) => {
    const now = new Date();
    let start, end;

    switch (option) {
      case "Last 30 Days":
        start = startOfDay(new Date(now));
        start.setDate(now.getDate() - 30);
        end = endOfDay(new Date(now));
        break;

      case "This Year":
        start = startOfDay(new Date(now.getFullYear(), 0, 1));
        end = endOfDay(new Date(now));
        break;

      case "This Month":
        start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
        end = endOfDay(new Date(now));
        break;

      case "This Week":
        const diff = getDiffFromSaturday(now.getDay());
        start = startOfDay(new Date(now));
        start.setDate(now.getDate() - diff);
        end = endOfDay(new Date(now));
        break;

      case "Last Week":
        const diff2 = getDiffFromSaturday(now.getDay());
        end = endOfDay(new Date(now));
        end.setDate(now.getDate() - diff2 - 1); // last week's Friday
        start = startOfDay(new Date(end));
        start.setDate(end.getDate() - 6); // start from Saturday
        break;

      case "Last Month":
        start = startOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 1));
        end = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
        break;

      case "Last Year":
        start = startOfDay(new Date(now.getFullYear() - 1, 0, 1));
        end = endOfDay(new Date(now.getFullYear() - 1, 11, 31));
        break;

      default:
        start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
        end = endOfDay(new Date(now));
    }

    return { start, end };
  };

  const pieColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  // ---------- RENDER ----------

  return (
    <div className="p-1">
      {/* Date Filter */}
      <div className="flex flex-col lg:flex-row justify-between">
        <div className="flex items-end mb-4">
          <select
            onChange={(e) => {
              const { start, end } = getDateRange(e.target.value);
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
                    {s?.totalSale || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs ">Discount</span>
                  <span className="text-sm font-medium text-red-500">
                    {s.totalDiscount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs ">Grand Total</span>
                  <span className="text-sm font-medium text-green-700">
                    {s.totalGrand}
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
        {/* asm summary */}
        <div className="w-full overflow-auto">
          <h4 className="global_heading">ASM Summary</h4>
          <table className="global_table">
            <thead className="global_thead">
              <tr className="global_tr">
                <th className="global_th">No</th>
                <th className="global_th">ASMName</th>
                <th className="global_th">ASMMobile</th>
                <th className="global_th">totalSale</th>
                <th className="global_th">totalDiscount</th>
                <th className="global_th">totalDebit</th>
                <th className="global_th">totalCredit</th>
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
                    <td className="global_td">{items?.totalSale || 0}</td>
                    <td className="global_td">{items?.totalDiscount || 0}</td>
                    <td className="global_td">{items?.totalDebit || 0}</td>
                    <td className="global_td">{items?.totalCredit || 0}</td>
                    <td className="global_td">
                      <Link
                        to={`/ASMReport/${items?.ASMID}`}
                        className="global_button"
                      >
                        Report
                      </Link>

                      <Link
                        to={`/MSO/${items?.ASMID}`}
                        className="global_button_red mx-4"
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
                    {asmSummary.reduce(
                      (sum, item) => sum + (item.totalSale || 0),
                      0
                    )}
                  </td>
                  <td className="global_td">
                    {asmSummary.reduce(
                      (sum, item) => sum + (item.totalDiscount || 0),
                      0
                    )}
                  </td>
                  <td className="global_td">
                    {asmSummary.reduce(
                      (sum, item) => sum + (item.totalDebit || 0),
                      0
                    )}
                  </td>
                  <td className="global_td">
                    {asmSummary.reduce(
                      (sum, item) => sum + (item.totalCredit || 0),
                      0
                    )}
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
                <th className="global_th">productName</th>
                <th className="global_th">totalWeight</th>
                <th className="global_th">totalQtySold</th>
                <th className="global_th">totalAmount</th>
              </tr>
            </thead>

            <tbody className="global_tbody">
              {productWeightSummary && productWeightSummary.length > 0 ? (
                productWeightSummary.map((items, index) => (
                  <tr key={index} className="global_tr">
                    <td className="global_td">{index + 1}</td>
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
                    <td className="global_td">{items?.totalAmount || 0}</td>
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
            {productWeightSummary && productWeightSummary.length > 0 && (
              <tfoot className="text-green-700">
                <tr className="global_tr">
                  <td className="global_td text-center">Total</td>
                  <td className="global_td text-center"></td>
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
                  <td className="global_td">
                    {productWeightSummary.reduce(
                      (sum, item) => sum + (item.totalAmount || 0),
                      0
                    )}
                  </td>
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
                <th className="global_th">MSOName</th>
                <th className="global_th">MSOMobile</th>
                <th className="global_th">totalSale</th>
                <th className="global_th">totalDiscount</th>
                <th className="global_th">totalDebit</th>
                <th className="global_th">totalCredit</th>
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
                    <td className="global_td">{items?.totalSale || 0}</td>
                    <td className="global_td">{items?.totalDiscount || 0}</td>
                    <td className="global_td">{items?.totalDebit || 0}</td>
                    <td className="global_td">{items?.totalCredit || 0}</td>
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
                    {msoSummary.reduce(
                      (sum, item) => sum + (item.totalSale || 0),
                      0
                    )}
                  </td>
                  <td className="global_td">
                    {msoSummary.reduce(
                      (sum, item) => sum + (item.totalDiscount || 0),
                      0
                    )}
                  </td>
                  <td className="global_td">
                    {msoSummary.reduce(
                      (sum, item) => sum + (item.totalDebit || 0),
                      0
                    )}
                  </td>
                  <td className="global_td">
                    {msoSummary.reduce(
                      (sum, item) => sum + (item.totalCredit || 0),
                      0
                    )}
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
