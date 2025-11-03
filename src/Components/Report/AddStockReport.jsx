import React, { useEffect, useState } from "react";
import { getDateRange } from "../../Helper/dateRangeHelper";
import DatePicker from "react-datepicker";
import { FaCalendarAlt } from "react-icons/fa";
import TimeAgo from "../../Helper/UI/TimeAgo";
import api from "../../Helper/Axios_Response_Interceptor";

export default function AddStockReport() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateInitialized, setDateInitialized] = useState(false);
  const [selectedRange, setSelectedRange] = useState("This Year");

  // data state
  const [stockReport, setStockReport] = useState([]);

  const formatDate = (date, endOfDay = false) => {
    const d = new Date(date);
    if (endOfDay) d.setHours(23, 59, 59, 999);
    else d.setHours(0, 0, 0, 0);

    const bdOffset = 6 * 60;
    const utc = d.getTime() + d.getTimezoneOffset() * 60000;
    const bdTime = new Date(utc + bdOffset * 60000);
    return bdTime.toISOString();
  };

  // stock report fetching
  const fetchData = async () => {
    if (!startDate || !endDate) return;
    const start = formatDate(startDate, false);
    const end = formatDate(endDate, true);

    const { data } = await api.get(
      `/AddStockReport/${start}/${end}`
    );
    if (data?.status === "Success") {
      setStockReport(data?.data || []);
    }
  };

  // first time set this month
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

  console.log(stockReport);

  return (
    <div>
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

      {/* data table */}
      <div className="w-full overflow-auto">
        <h4 className="global_heading">Category Summary</h4>
        <table className="global_table">
          <thead className="global_thead">
            <tr className="global_tr">
              <th className="global_th ">no</th>
              <th className="global_th ">product Name</th>
              <th className="global_th ">per Weight</th>
              <th className="global_th ">total Weight</th>
              <th className="global_th ">Date</th>
              <th className="global_th ">qty</th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {stockReport && stockReport?.length > 0 ? (
              stockReport?.map((items, index) => (
                <tr key={index} className="global_tr">
                  <td className="global_td">{index + 1}</td>
                  <td className="global_td">
                    {items?.productName ? items?.productName : "N/A"}
                  </td>
                  <td className="global_td">
                    {items?.productWeight
                      ? (() => {
                          const weight = items?.productWeight || 0;
                          const kg = Math.floor(weight / 1000);
                          const gram = weight % 1000;

                          if (weight === 0) return "0 g";
                          if (kg > 0 && gram > 0) return `${kg} kg ${gram} g`;
                          if (kg > 0) return `${kg} kg`;
                          return `${gram} g`;
                        })()
                      : "N/A"}
                  </td>
                  <td className="global_td">
                    {items?.productWeight
                      ? (() => {
                          const totalWeight =
                            (items.productWeight || 0) * (items.qty || 1); // weight * qty
                          const kg = Math.floor(totalWeight / 1000);
                          const gram = totalWeight % 1000;

                          if (totalWeight === 0) return "0 g";
                          if (kg > 0 && gram > 0) return `${kg} kg ${gram} g`;
                          if (kg > 0) return `${kg} kg`;
                          return `${gram} g`;
                        })()
                      : "N/A"}
                  </td>
                  <td className="global_td"><TimeAgo date={items.CreatedDate} /></td>
                  <td className="global_td">{items?.qty ? items?.qty : 0}</td>
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
          {stockReport && stockReport.length > 0 && (
            <tfoot className="text-green-700">
              <tr className="global_tr">
                <td className="global_td text-center">Total</td>
                <td className="global_td text-center"></td>
                <td className="global_td text-center"></td>
                <td className="global_td text-center"></td>
                <td className="global_td">
                  {/* {stockReport.reduce(
                      (sum, item) => sum + (item.productWeight || 0),
                      0
                    )} */}
                </td>
                <td className="global_td text-center">
                  {/* {stockReport.reduce((sum, item) => sum + (item.qty || 0), 0)} */}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
