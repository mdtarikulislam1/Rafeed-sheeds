import React, { useEffect, useRef, useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link, useParams } from "react-router-dom";
import loadingStore from "../../Zustand/LoadingStore";
import { useDownloadStore } from "../../Helper/Download-xlsx";
import { getDateRange } from "../../Helper/dateRangeHelper";
import api from "../../Helper/Axios_Response_Interceptor";

const RsmReport = () => {
  const { id } = useParams();
  const { setGlobalLoader } = loadingStore();
  const [asmSummary, setAsmSummary] = useState([]);
  const [weight, setWeight] = useState([]);
  const [msoSummary, setMsoSummary] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [totalData, setTotalData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateInitialized, setDateInitialized] = useState(false);
  const [selectedRange, setSelectedRange] = useState("This Year");

  // new state for filter
  const [selectedCategory, setSelectedCategory] = useState("0");

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
      const { data } = await api.get(
        `/RSMReport/${id}/${start}/${end}`
      );

      if (data?.status === "success") {
        setAsmSummary(data.asmSummary || []);
        setWeight(data.productWeightSummary || []);
        setMsoSummary(data.msoSummary || []);
        setSalesByCategory(data.salesByCategory || []);
        setTotalData(data?.RSM || []);
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
  }, [startDate, id, endDate, dateInitialized]);

  // Filtered data based on category selection
  const filteredSales =
    selectedCategory === "0"
      ? salesByCategory
      : salesByCategory.filter(
          (item) => item.CategoryName === selectedCategory
        );

  const filteredWeight =
    selectedCategory === "0"
      ? weight
      : weight.filter((item) => item.CategoryName === selectedCategory);

  // //  Filtered ASM Summary
  // const filteredAsmSummary =
  //   selectedCategory === "0"
  //     ? asmSummary
  //     : asmSummary.filter((item) => item.CategoryName === selectedCategory);

  // // Filtered MSO Summary
  // const filteredMsoSummary =
  //   selectedCategory === "0"
  //     ? msoSummary
  //     : msoSummary.filter((item) => item.CategoryName === selectedCategory);

  return (
    <div className="my-5 px-2 " ref={containerRef}>
      <div className="flex flex-col lg:flex-row items-start justify-between no-print">
        <div className="flex items-end mb-4">
          <select
            value={selectedRange}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedRange(value);
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
      <div className="flex justify-between">
        <div>
          {totalData?.RSMName && (
            <h4 className="user-name">Name: {totalData.RSMName}</h4>
          )}
          {totalData?.RSMMobile && (
            <p className="user-mobile">Mobile: {totalData.RSMMobile}</p>
          )}
        </div>

        {/*Category Filter */}
        <div>
          <select
            className="global_dropdown min-w-40"
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
      </div>

      {/*Sales By Category Table */}
      <div className="my-4">
        <h4 className="global_heading">Sales By Category</h4>
        <div className="w-full overflow-auto">
          <table className="global_table">
            <thead className="global_thead">
              <tr className="global_tr">
                <th className="global_th">No</th>
                <th className="global_th">Category Name</th>
                <th className="global_th">Total Sale</th>
                <th className="global_th">Total Discount</th>
                <th className="global_th">Total Grand</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {filteredSales.length > 0 ? (
                filteredSales.map((items, index) => (
                  <tr key={index} className="global_tr">
                    <td className="global_td">{index + 1}</td>
                    <td className="global_td">
                      {items?.CategoryName || "N/A"}
                    </td>
                    <td className="global_td">
                      {(items?.totalSale || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="global_td">{items?.totalDiscount || 0}</td>
                    <td className="global_td">
                      {(items?.totalGrand || 0).toLocaleString("en-IN")}
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
          </table>
        </div>
      </div>

      {/* ✅ Product Weight Summary Table */}
      <div className="my-4">
        <h4 className="global_heading">Product Weight Summary</h4>
        <div className="w-full overflow-auto">
          <table className="global_table">
            <thead className="global_thead">
              <tr className="global_tr">
                <th className="global_th">No</th>
                <th className="global_th">Product Name</th>
                <th className="global_th">Total Weight</th>
                <th className="global_th">Total Qty Sold</th>
                <th className="global_th">Total Amount</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {filteredWeight.length > 0 ? (
                filteredWeight.map((items, index) => (
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
                  <td colSpan="8" className="text-center py-3 text-gray-500">
                    No Data Found
                  </td>
                </tr>
              )}
            </tbody>
            {filteredWeight && filteredWeight.length > 0 && (
              <tfoot className="text-green-700">
                <tr className="global_tr">
                  <td className="global_td text-center">Total</td>
                  <td className="global_td text-center"></td>

                  <td className="global_td text-center">
                    {(() => {
                      const totalWeight = filteredWeight.reduce(
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
                  <td className="global_td text-center"></td>
                  <td className="global_td">
                    {filteredWeight
                      .reduce((sum, item) => sum + (item.totalAmount || 0), 0)
                      .toLocaleString("en-IN")}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* asm summary */}
      <div className="my-4 no-print no-download">
        <h4 className="global_heading">
          ASM Summary
          {/* {selectedCategory !== "All" && `(Filtered: ${selectedCategory})`} */}
        </h4>
        <div className="w-full overflow-auto">
          <table className="global_table">
            <thead className="global_thead">
              <tr className="global_tr text-nowrap">
                <th className="global_th">no</th>
                <th className="global_th">ASM Name</th>
                <th className="global_th">ASM Mobile</th>
                <th className="global_th">total Sale</th>
                <th className="global_th">total Discount</th>
                <th className="global_th">total Debit</th>
                {/* <th className="global_th">total Credit</th> */}
                <th className="global_th">total Grand</th>
                <th className="global_th">action</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {asmSummary.length > 0 ? (
                asmSummary.map((items, index) => (
                  <tr key={index} className="global_tr ">
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
                    {/* <td className="global_td">
                      {(items?.totalCredit || 0).toLocaleString("en-IN")}
                    </td> */}
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
                        className="global_button"
                      >
                        Mso
                      </Link>
                      <Link
                        to={`/DealerList/${items?.ASMID}`}
                        className="global_button"
                      >
                        Dealer
                      </Link>
                      <Link
                        to={`/salereportPage/${items.ASMID}`}
                        className="global_button"
                      >
                        Sale Report
                      </Link>
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
                  {/* <td className="global_td">
                    {asmSummary
                      .reduce((sum, item) => sum + (item.totalCredit || 0), 0)
                      .toLocaleString("en-IN")}
                  </td> */}
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
      </div>

      {/* mso summary */}

      {/* MSO Summary with Category Filter */}
      <div className="my-4 no-print no-download">
        <h4 className="global_heading">
          MSO Summary
          {/* {selectedCategory !== "All" && `(Filtered: ${selectedCategory})`} */}
        </h4>
        <div className="w-full overflow-auto">
          <table className="global_table">
            <thead className="global_thead">
              <tr className="global_tr">
                <th className="global_th">no</th>
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
              {msoSummary.length > 0 ? (
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
                        to={`/MSOReport/${items.MSOID}`}
                      >
                        Report
                      </Link>
                      <Link
                        to={`/DealerList/${items.MSOID}`}
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
                  <td colSpan="9" className="text-center py-3 text-gray-500">
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

export default RsmReport;
