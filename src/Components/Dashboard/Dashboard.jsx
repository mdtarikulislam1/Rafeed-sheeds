import { FaCalendarAlt } from "react-icons/fa";
import { getDateRange } from "../../Helper/dateRangeHelper";
import DatePicker from "react-datepicker";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { getToken } from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const Dashboard = () => {
  const { setGlobalLoader } = loadingStore();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateInitialized, setDateInitialized] = useState(false);
  const [selectedRange, setSelectedRange] = useState("This Year");

  // data state
  const [summary, setSummary] = useState([]);

  const formatDate = (date, endOfDay = false) => {
    const d = new Date(date);
    if (endOfDay) d.setHours(23, 59, 59, 999);
    else d.setHours(0, 0, 0, 0);

    const bdOffset = 6 * 60;
    const utc = d.getTime() + d.getTimezoneOffset() * 60000;
    const bdTime = new Date(utc + bdOffset * 60000);
    return bdTime.toISOString();
  };
  // data fetching
  const fetchData = async () => {
    setGlobalLoader(true);
    if (!startDate || !endDate) return;

    const start = formatDate(startDate, false);
    const end = formatDate(endDate, true);

    try {
      const { data } = await axios.get(`${BaseURL}/Dashboard/${start}/${end}`, {
        headers: { token: getToken() },
      });
      console.log(data);
      if (data?.status === "Success") {
        setSummary(data?.data);
      }
    } catch (error) {
      console.log(error);
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

  const pieColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  return (
    <div className="p-1">
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
      <div className="flex flex-col lg:flex-row gap-2 mt-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 flex-1">
          {summary.map((s, i) => (
            <div
              key={i}
              className="rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
            >
              <div className="px-5 py-1 text-center text-lg font-semibold text-white bg-green-500">
                {s.CategoryName}
              </div>
              <div className="p-2 space-y-3">
                <div className="flex justify-between  pt-2">
                  <span className="text-xs ">Total Sales:</span>
                  <span className="text-lg font-bold text-green-600">
                    ৳{(s?.TotalSale || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs ">Collection</span>
                  <span className="text-lg font-bold text-green-600">
                    ৳{(s?.TotalDebit || 0).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between  pt-2">
                  <span className="text-xs ">Total Weight:</span>
                  <span className="text-lg font-bold text-green-600">
                    {(() => {
                      const weight = s?.totalWeight || 0;
                      const kg = Math.floor(weight / 1000);
                      const gram = weight % 1000;

                      if (weight === 0) return "0 g";
                      if (kg > 0 && gram > 0) return `${kg} kg ${gram} g`;
                      if (kg > 0) return `${kg} kg`;
                      return `${gram} g`;
                    })()}
                  </span>
                </div>
              </div>
              <div className="px-5 py-3 flex justify-between items-center bg-gradient-to-r from-amber-200 to-amber-400 dark:from-amber-700 dark:to-amber-900 text-sm font-semibold rounded-xl shadow-md">
                <div className="flex flex-col">
                  <span className="text-gray-700 dark:text-gray-200">
                    Collection
                  </span>
                  <span className="text-gray-900 dark:text-white text-lg mt-1">
                    {s.TotalCredit > 0
                      ? `${((s.TotalDebit / s.TotalCredit) * 100).toFixed(2)}%`
                      : "0%"}
                  </span>
                </div>
                <div className="bg-white dark:bg-amber-800 px-3 py-1 rounded-full shadow-inner text-gray-800 dark:text-white text-sm font-medium">
                  {/* Optional: could show icon or extra info */}
                  {s.TotalDebit.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* rsm Distribution Pie Chart */}
        <div className=" rounded-xl shadow-md border outline-0 border-gray-200 w-full lg:w-80 flex-shrink-0">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={summary}
                cx="45%"
                cy="50%"
                outerRadius={60}
                dataKey="TotalSale"
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
    </div>
  );
};

export default Dashboard;
