import React, { useEffect, useRef, useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link, useParams } from "react-router-dom";
import loadingStore from "../../Zustand/LoadingStore";
import { useDownloadStore } from "../../Helper/Download-xlsx";
import { getDateRange } from "../../Helper/dateRangeHelper";
import api from "../../Helper/Axios_Response_Interceptor";

const AsmReport = () => {
  const { id } = useParams();
  const { setGlobalLoader } = loadingStore();

  const [summary, setSummary] = useState([]);
  const [weight, setWeight] = useState([]);
  const [msoSummary, setMsoSummary] = useState([]);
  const [totalData, setTotalData] = useState([]);

    // new state for filter
  const [selectedCategory, setSelectedCategory] = useState("0");

// date sate
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
      const { data } = await api.get(`/ASMReport/${id}/${start}/${end}`);

      if (data?.status === "success") {
        setSummary(data?.salesByCategory || []);
        setWeight(data?.productWeightSummary || []);
        setMsoSummary(data?.msoSummary || []);
        setTotalData(data?.ASM || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  // ✅ প্রথমে শুধু একবার "This Month" সেট করা
  useEffect(() => {
    const { start, end } = getDateRange("This Year");
    setStartDate(start);
    setEndDate(end);
    setSelectedRange("This Year");
    setDateInitialized(true);
  }, []);

  // ✅ যখন তারিখ সেট হয়ে যায়, তখনই ডেটা ফেচ করা হবে
  useEffect(() => {
    if (dateInitialized) {
      fetchData();
    }
  }, [startDate, id, endDate, dateInitialized]);

  // category summary

    const filteredsummary =
    selectedCategory === "0"
      ? summary
      : summary.filter((item) => item.CategoryName === selectedCategory);

      // weight
    const filteredweight =
    selectedCategory === "0"
      ? weight
      : weight.filter((item) => item.CategoryName === selectedCategory);

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

      <div className="flex justify-between">
        {/* user data */}
        <div>
          {totalData?.ASMName ? (
            <h4 className="user-name">NAME: {totalData?.ASMName}</h4>
          ) : (
            ""
          )}
          {totalData?.ASMMobile ? (
            <p className="user-mobile">MOBILE: {totalData?.ASMMobile}</p>
          ) : (
            ""
          )}
        </div>
        {/* Category Filter */}
        <div>
          <select
            className="global_dropdown min-w-40"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="0">All</option>
            {summary.map((items, index) => (
              <option key={index} value={items?.CategoryName}>
                {items?.CategoryName}
              </option>
            ))}
          </select>
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
            {filteredsummary && filteredsummary.length > 0 ? (
              filteredsummary.map((items, index) => (
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
                    {(items?.TotalGrand || 0).toLocaleString("en-IN")}
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
          {filteredsummary && filteredsummary.length > 0 && (
            <tfoot className="text-green-700">
              <tr className="global_tr">
                <td className="global_td text-center">Total</td>
                <td className="global_td text-center"></td>
                <td className="global_td">
                  {filteredsummary
                    .reduce((sum, item) => sum + (item.totalSale || 0), 0)
                    .toLocaleString("en-IN")}
                </td>
                <td className="global_td">
                  {filteredsummary
                    .reduce((sum, item) => sum + (item.totalDiscount || 0), 0)
                    .toLocaleString("en-IN")}
                </td>
                <td className="global_td">
                  {filteredsummary
                    .reduce((sum, item) => sum + (item.TotalGrand || 0), 0)
                    .toLocaleString("en-IN")}
                </td>
              </tr>
            </tfoot>
          )}
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
              <th className="global_th">total Qty</th>
              <th className="global_th">Total Amount</th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {filteredweight && filteredweight.length > 0 ? (
              filteredweight.map((items, index) => (
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
                  <td className="global_td">
                    {(items?.totalAmount || 0).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-3 text-gray-500">
                  No Data Found
                </td>
              </tr>
            )}
          </tbody>

          {filteredweight && filteredweight.length > 0 && (
            <tfoot className="text-green-700">
              <tr className="global_tr">
                <td className="global_td text-center">Total</td>
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

      {/* MSO Summary */}
      <div className="w-full overflow-x-auto text-nowrap my-3 no-print no-download">
        <h4 className="global_heading">MSO Summary</h4>

        <table className="global_table min-w-[600px]">
          <thead className="global_thead">
            <tr>
              <th className="global_th">No</th>
              <th className="global_th">MSO Name</th>
              <th className="global_th">Mobile</th>
              <th className="global_th">Total Sale</th>
              <th className="global_th">Discount</th>
              <th className="global_th">totalDebit</th>
              {/* <th className="global_th">totalCredit</th> */}
              <th className="global_th">totalGrand</th>
              <th className="global_th">action</th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {msoSummary && msoSummary.length > 0 ? (
              msoSummary.map((items, index) => (
                <tr key={index} className="global_tr">
                  <td className="global_td">{index + 1}</td>
                  <td className="global_td">{items?.MSOName || "N/A"}</td>
                  <td className="global_td">{items?.MSOMobile || 0}</td>
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
                    <Link
                      to={`/salereportPage/${items.MSOID}`}
                      className="global_button"
                    >
                      Sale Report
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
