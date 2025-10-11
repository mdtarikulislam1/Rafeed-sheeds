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

  const [summary, setSummary] = useState([]);
  const [weight, setWeight] = useState([]);
  const [msoSummary, setMsoSummary] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateInitialized, setDateInitialized] = useState(false);

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
      const res = await axios.get(
        `${BaseURL}/ASMReport/${id}/${start}/${end}`,
        {
          headers: { token: getToken() },
        }
      );

      if (res?.data?.status === "success") {
        setSummary(res.data.salesByCategory || []);
        setWeight(res.data.productWeightSummary || []);
        setMsoSummary(res.data.msoSummary || []);
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
      {/* salesByCategory */}

      <div className="w-full overflow-x-auto text-nowrap my-3">
        <h4 className="global_heading">Sales By Category</h4>

        <table className="global_table min-w-[600px]">
          <thead className="global_thead">
            <tr>
              <th className="global_th">No</th>
              <th className="global_th">Category Name</th>
              <th className="global_th">Total Sale</th>
              <th className="global_th">Total Discount</th>
              <th className="global_th">Total Grand</th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {summary?.map((items, index) => (
              <tr key={index} className="global_tr">
                <td className="global_td">{index + 1}</td>
                <td className="global_td">
                  {items?.CategoryName ? items?.CategoryName : "N/A"}
                </td>
                <td className="global_td">
                  {items?.totalSale ? items?.totalSale : "N/A"}
                </td>
                <td className="global_td">
                  {items?.totalDiscount ? items?.totalDiscount : "N/A"}
                </td>
                <td className="global_td">
                  {items?.totalGrand ? items?.totalGrand : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product Weight Summary */}
      <div className="w-full overflow-x-auto text-nowrap my-3">
        <h4 className="global_heading">Product Weight Summary</h4>

        <table className="global_table min-w-[600px]">
          <thead className="global_thead">
            <tr>
              <th className="global_th">No</th>
              <th className="global_th">Product Name</th>
              <th className="global_th">Total Weight</th>
              <th className="global_th">Total Amount</th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {weight?.map((items, index) => (
              <tr key={index} className="global_tr">
                <td className="global_td">{index + 1}</td>
                <td className="global_td">{items?.productName ? items?.productName : 'N/A'}</td>
                <td className="global_td">
                  {(() => {
                    const w = items?.totalWeight || 0;

                    if (w === 0) {
                      return "N/A";
                    }

                    if (w < 1000) {
                      return `${w} g`;
                    }
                    const kg = Math.floor(w / 1000);
                    const g = w % 1000;
                    return `${kg} kg ${g > 0 ? g + " g" : ""}`;
                  })()}
                </td>
                <td className="global_td">{items?.totalAmount ? items?.totalAmount : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MSO Summary */}
      <div className="w-full overflow-x-auto text-nowrap my-3">
        <h4 className="global_heading">MSO Summary</h4>

        <table className="global_table min-w-[600px]">
          <thead className="global_thead">
            <tr>
              <th className="global_th">No</th>
              <th className="global_th">MSO Name</th>
              <th className="global_th">Mobile</th>
              <th className="global_th">Email</th>
              <th className="global_th">Total Sale</th>
              <th className="global_th">Discount</th>
              <th className="global_th">Grand Total</th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {msoSummary?.map((items, index) => (
              <tr key={index} className="global_tr">
                <td className="global_td">{index + 1}</td>
                <td className="global_td">{items?.MSOName ? items?.MSOName : 'N/A'}</td>
                <td className="global_td">{items?.MSOMobile ? items?.MSOMobile : 'N/A'}</td>
                <td className="global_td">{items?.MSOEmail || " N/A"}</td>
                <td className="global_td">{items?.totalSale ? items?.totalSale : 'N/A'}</td>
                <td className="global_td">
                  {items?.totalDiscount == 0 ? "N/A" : items?.totalDiscount}
                </td>
                <td className="global_td">{items?.totalGrand || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AsmReport;
