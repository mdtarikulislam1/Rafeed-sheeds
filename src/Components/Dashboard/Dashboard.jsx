import React, { useEffect, useState } from "react";

import { ErrorToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken, removeSessions } from "../../Helper/SessionHelper";
import { FaCalendarAlt } from "react-icons/fa";
import { createPortal } from "react-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import { getDateRange } from "../../Helper/dateRangeHelper";

const Dashboard = () => {
  const { setGlobalLoader } = loadingStore();
  const [RSMdetails, setRSMdetails] = useState([]);
  const [ASMdetails, setASMdetails] = useState([]);
  const [MSOdetails, setMSOdetails] = useState([]);
  const [summary, setSummary] = useState([]);
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
      const res = await axios.get(`${BaseURL}/GetByDate/${start}/${end}`, {
        headers: { token: getToken() },
      });
      if (res?.data.summary) {
        setSummary(res.data.summary);
        setRSMdetails(res.data.detailsByRSM);
        setASMdetails(res.data.detailsByASM);
        setMSOdetails(res.data.detailsByMSO);
      }
    } catch (error) {
      ErrorToast(error.message);
      console.error(error);
      removeSessions();
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
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
          {summary.map((s, i) => (
            <div
              key={i}
              className="rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
            >
              <div className="px-5 py-1 text-center text-lg font-semibold text-white bg-green-500">
                {s.categoryName}
              </div>
              <div className="p-2 space-y-3">
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-xs ">Total Sales:</span>
                  <span className="text-lg font-bold text-green-600">
                    {s?.totalSales || 0}
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
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-xs ">Total Collection</span>
                  <span className="text-lg font-bold text-green-500">
                    {s.totalDebit}
                  </span>
                </div>
              </div>
              <div className="px-5 py-2 text-center bg-amber-100 dark:bg-amber-800 text-xs font-medium">
                {s.totalSales > 0
                  ? ((s.totalDebit / s.totalSales) * 100).toFixed(1)
                  : 0}
                % Collection Rate
              </div>
            </div>
          ))}
        </div>

        {/* rsm Distribution Pie Chart */}
        <div className=" rounded-xl shadow-md border border-gray-200 w-full lg:w-80 flex-shrink-0">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={summary}
                cx="45%"
                cy="50%"
                outerRadius={60}
                dataKey="totalSales"
                nameKey="categoryName"
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
                {summary.map((entry, index) => (
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

      {/* Example Summary Data Rendering */}

      <div className="flex flex-col gap-2 mt-5">
        {/* RSM */}
        <div className="global_sub_container overflow-auto">
          <h1 className="text-center font-[600] ">RSM</h1>{" "}
          {
            <table className="global_table">
              <thead className="global_thead">
                <tr>
                  <th className="global_th">no</th>
                  <th className="global_th">Name</th>
                  <th className="global_th">Category</th>
                  <th className="global_th">Sale</th>
                  <th className="global_th">Discount</th>
                  <th className="global_th">debit</th>
                  <th className="global_th">Grand</th>
                  <th className="global_th">Action</th>
                </tr>
              </thead>
              <tbody className="global_tbody">
                {RSMdetails.length > 0 ? (
                  RSMdetails.map((rsm, index) => (
                    <tr key={index} className="global_tr">
                      <td className="global_td">{index + 1}</td>
                      <td className="global_td">{rsm.rsmName}</td>
                      <td className="global_td">{rsm.categoryName}</td>
                      <td className="global_td">{rsm.totalSales}</td>
                      <td className="global_td">{rsm.totalDiscount}</td>
                      <td className="global_td">{rsm.totalDebit}</td>
                      <td className="global_td">{rsm.totalGrand}</td>

                      <td className="global_td space-x-2">
                        <Link
                          to={`/RSMReport/${rsm?.RSMID}`}
                          className="global_button"
                        >
                          Report
                        </Link>
                        <Link
                          to={`/ASM/${rsm?.RSMID}`}
                          className="global_button"
                        >
                          Asm
                        </Link>
                        <Link
                          to={`/MSO/${rsm?.RSMID}`}
                          className="global_button"
                        >
                          Mso
                        </Link>
                        <Link
                          to={`/DealerList/${rsm?.RSMID}`}
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
                      No Data
                    </td>
                  </tr>
                )}
              </tbody>
              {RSMdetails && RSMdetails.length > 0 && (
                <tfoot className="text-green-700">
                  <tr className="global_tr">
                    <td className="global_td text-center">Total</td>
                    <td className="global_td text-center"></td>
                    <td className="global_td text-center"></td>
                    <td className="global_td">
                      {RSMdetails.reduce(
                        (sum, item) => sum + (item.totalSales || 0),
                        0
                      )}
                    </td>
                    <td className="global_td">
                      {RSMdetails.reduce(
                        (sum, item) => sum + (item.totalDiscount || 0),
                        0
                      )}
                    </td>
                    <td className="global_td">
                      {RSMdetails.reduce(
                        (sum, item) => sum + (item.totalDebit || 0),
                        0
                      )}
                    </td>
                    <td className="global_td">
                      {RSMdetails.reduce(
                        (sum, item) => sum + (item.totalGrand || 0),
                        0
                      )}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          }
        </div>

        {/* asm */}
        <div className="global_sub_container overflow-auto">
          <h1 className="text-center font-[600] ">ASM</h1>{" "}
          {
            <table className="global_table">
              <thead className="global_thead">
                <tr>
                  <th className="global_th">no</th>
                  <th className="global_th">Name</th>
                  <th className="global_th">Category</th>
                  <th className="global_th">Sale</th>
                  <th className="global_th">Discount</th>
                  <th className="global_th">debit</th>
                  <th className="global_th">Grand</th>
                  <th className="global_th">Action</th>
                </tr>
              </thead>
              <tbody className="global_tbody">
                {ASMdetails.length > 0 ? (
                  ASMdetails.map((asm, index) => (
                    <tr key={index} className="global_tr">
                      <td className="global_td">{index + 1}</td>
                      <td className="global_td">{asm.asmName}</td>
                      <td className="global_td">{asm.categoryName}</td>
                      <td className="global_td">{asm.totalSales}</td>
                      <td className="global_td">{asm.totalDiscount}</td>
                      <td className="global_td">{asm.totalDebit}</td>
                      <td className="global_td">{asm.totalGrand}</td>
                      <td className="global_td space-x-2">
                        {/* akane ai report ta dynamic hobe */}
                        <Link
                          to={`/ASMReport/${asm?.ASMID}`}
                          className="global_button"
                        >
                          Report
                        </Link>
                        <Link
                          to={`/MSO/${asm?.ASMID}`}
                          className="global_button"
                        >
                          Mso
                        </Link>
                        <Link
                          to={`/DealerList/${asm?.ASMID}`}
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
                      No Data
                    </td>
                  </tr>
                )}
              </tbody>
              {/* ✅ Table Footer Totals */}
              {ASMdetails && ASMdetails.length > 0 && (
                <tfoot className="text-green-700">
                  <tr className="global_tr">
                    <td className="global_td text-center">Total</td>
                    <td className="global_td text-center"></td>
                    <td className="global_td text-center"></td>
                    <td className="global_td">
                      {ASMdetails.reduce(
                        (sum, item) => sum + (item.totalSales || 0),
                        0
                      )}
                    </td>
                    <td className="global_td">
                      {ASMdetails.reduce(
                        (sum, item) => sum + (item.totalDiscount || 0),
                        0
                      )}
                    </td>
                    <td className="global_td">
                      {ASMdetails.reduce(
                        (sum, item) => sum + (item.totalDebit || 0),
                        0
                      )}
                    </td>
                    <td className="global_td">
                      {ASMdetails.reduce(
                        (sum, item) => sum + (item.totalGrand || 0),
                        0
                      )}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          }
        </div>

        {/* MSO */}
        <div className="global_sub_container overflow-auto">
          <h1 className="text-center font-[600] ">MSO</h1>{" "}
          {
            <table className="global_table">
              <thead className="global_thead">
                <tr>
                  <th className="global_th">No</th>
                  <th className="global_th">Name</th>
                  <th className="global_th">Category</th>
                  <th className="global_th">Sale</th>
                  <th className="global_th">Discount</th>
                  <th className="global_th">total Debit</th>
                  <th className="global_th">Grand</th>
                  <th className="global_th">action</th>
                </tr>
              </thead>
              <tbody className="global_tbody">
                {MSOdetails.length > 0 ? (
                  MSOdetails.map((mso, index) => (
                    <tr key={index} className="global_tr">
                      <td className="global_td">{index + 1}</td>
                      <td className="global_td">{mso.msoName}</td>
                      <td className="global_td">{mso.categoryName}</td>
                      <td className="global_td">{mso.totalSales}</td>
                      <td className="global_td">{mso.totalDiscount}</td>
                      <td className="global_td">{mso.totalDebit}</td>
                      <td className="global_td">{mso.totalGrand}</td>
                      <td className="global_td space-x-2">
                        <Link
                          className="global_button"
                          to={`/MSOReport/${mso?.MSOID}`}
                        >
                          Report
                        </Link>
                        <Link
                          to={`/DealerList/${mso?.MSOID}`}
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
                      No Data
                    </td>
                  </tr>
                )}
              </tbody>
              {/* ✅ Table Footer Totals */}
              {MSOdetails && MSOdetails.length > 0 && (
                <tfoot className="text-green-700">
                  <tr className="global_tr">
                    <td className="global_td text-center">Total</td>
                    <td className="global_td text-center"></td>
                    <td className="global_td text-center"></td>
                    <td className="global_td">
                      {MSOdetails.reduce(
                        (sum, item) => sum + (item.totalSales || 0),
                        0
                      )}
                    </td>
                    <td className="global_td">
                      {MSOdetails.reduce(
                        (sum, item) => sum + (item.totalDiscount || 0),
                        0
                      )}
                    </td>
                    <td className="global_td">
                      {MSOdetails.reduce(
                        (sum, item) => sum + (item.totalDebit || 0),
                        0
                      )}
                    </td>
                    <td className="global_td">
                      {MSOdetails.reduce(
                        (sum, item) => sum + (item.totalGrand || 0),
                        0
                      )}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          }
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
