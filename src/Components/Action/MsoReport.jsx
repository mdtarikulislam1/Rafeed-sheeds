import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useParams } from "react-router-dom";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";

const AsmReport = () => {
  const { id } = useParams();
  const { setGlobalLoader } = loadingStore();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateInitialized, setDateInitialized] = useState(false);

  // data state
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [productWeightSummary, setProductWeightSummary] = useState([]);

  // Helper functions
  const startOfDay = (d) => {
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const endOfDay = (d) => {
    d.setHours(23, 59, 59, 999);
    return d;
  };
  const getDiffFromSaturday = (day) => (day + 1) % 7;

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
        end.setDate(now.getDate() - diff2 - 1);
        start = startOfDay(new Date(end));
        start.setDate(end.getDate() - 6);
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
        `${BaseURL}/MSOReport/${id}/${start}/${end}`,
        {
          headers: { token: getToken() },
        }
      );

      if (data?.status === "success") {
        setProductWeightSummary(data?.productWeightSummary);
        setSalesByCategory(data?.salesByCategory);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  // ✅ প্রথমে শুধু একবার "This Month" সেট করা
  useEffect(() => {
    const { start, end } = getDateRange("This Month");
    setStartDate(start);
    setEndDate(end);
    setDateInitialized(true);
  }, []);

  // ✅ যখন তারিখ সেট হয়ে যায়, তখনই ডেটা ফেচ করা হবে
  useEffect(() => {
    if (dateInitialized) {
      fetchData();
    }
  }, [startDate, endDate, dateInitialized]);

  return (
    <div className="my-5 px-2">
      <div className="flex flex-col lg:flex-row items-start justify-between">
        <div className="flex items-end mb-4">
          <select
            defaultValue="This Month"
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

      {/* table by data */}

      {/* salesByCategory */}
      <div className="w-full overflow-auto">
        <h4 className="global_heading">Sales By Category</h4>
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
                  <td className="global_td">{items?.totalSale || 0}</td>
                  <td className="global_td">{items?.totalDiscount || 0}</td>
                  <td className="global_td">{items?.totalGrand || 0}</td>
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
            <tfoot className="bg-gray-100 font-semibold">
              <tr className="global_tr">
                <td className="global_td text-center text-green-700">Total</td>
                <td className="global_td text-center"></td>
                <td className="global_td">
                  {salesByCategory.reduce(
                    (sum, item) => sum + (item.totalSale || 0),
                    0
                  )}
                </td>
                <td className="global_td">
                  {salesByCategory.reduce(
                    (sum, item) => sum + (item.totalDiscount || 0),
                    0
                  )}
                </td>
                <td className="global_td">
                  {salesByCategory.reduce(
                    (sum, item) => sum + (item.totalGrand || 0),
                    0
                  )}
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
              <th className="global_th">total Qty Sold</th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {productWeightSummary && productWeightSummary.length > 0 ? (
              productWeightSummary.map((items, index) => (
                <tr key={index} className="global_tr">
                  <td className="global_td">{index + 1}</td>
                  <td className="global_td">{items?.productName || "N/A"}</td>
                  <td className="global_td">{items?.totalAmount || 0}</td>
                  <td className="global_td">{items?.totalWeight || 0}</td>
                  <td className="global_td">{items?.totalQtySold || 0}</td>
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
          {productWeightSummary && productWeightSummary.length > 0 && (
            <tfoot className="bg-gray-100 font-semibold">
              <tr className="global_tr">
                <td className="global_td text-center text-green-700">Total</td>
                <td className="global_td text-center"></td>
                <td className="global_td">
                  {productWeightSummary.reduce(
                    (sum, item) => sum + (item.totalAmount || 0),
                    0
                  )}
                </td>
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
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default AsmReport;
