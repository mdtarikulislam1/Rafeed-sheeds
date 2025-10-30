import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link, useParams } from "react-router-dom";
import loadingStore from "../../Zustand/LoadingStore";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { useDownloadStore } from "../../Helper/Download-xlsx";
import { getDateRange } from "../../Helper/dateRangeHelper";
import SaleReport from "../Report/SaleReport";

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
      const { data } = await axios.get(
        `${BaseURL}/RSMReport/${id}/${start}/${end}`,
        {
          headers: { token: getToken() },
        }
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
  }, [startDate,id, endDate, dateInitialized]);

  return (
    <div className="my-5 px-2 " ref={containerRef}>
      <div className="flex flex-col lg:flex-row items-start justify-between no-print">
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

      {/* user Data */}

      <div>
        {totalData?.RSMName ? (
          <h4 className="user-name">Name: {totalData?.RSMName}</h4>
        ) : (
          ""
        )}
        {totalData?.RSMMobile ? (
          <p className="user-mobile">Mobile: {totalData?.RSMMobile}</p>
        ) : (
          ""
        )}
      </div>

      {/* table */}

{/* sales report */}
<SaleReport id={id} start={startDate} end={endDate} />


      <div>
        {/* salesByCategory   */}
        <div className="my-4">
          <h4 className="global_heading">Sales By Category</h4>
          <div className="w-full overflow-auto">
            <table className="global_table ">
              <thead className="global_thead">
                <tr className="global_tr">
                  <th className="global_th">no</th>
                  <th className="global_th">CategoryName</th>
                  <th className="global_th">totalSale</th>
                  <th className="global_th">totalDiscount</th>
                  <th className="global_th">totalGrand</th>
                </tr>
              </thead>
              <tbody className="global_tbody">
                {salesByCategory && salesByCategory.length > 0 ? (
                  salesByCategory.map((items, index) => (
                    <tr key={index} className="global_tr">
                      <td className="global_td">{index + 1}</td>

                      <td className="global_td">
                        {items?.CategoryName || "N/A"}
                      </td>
                      <td className="global_td">{items?.totalSale || 0}</td>
                      <td className="global_td">{items?.totalDiscount || 0}</td>
                      <td className="global_td">{items?.totalGrand || 0}</td>
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
              {salesByCategory && salesByCategory.length > 0 && (
                <tfoot className="text-green-700">
                  <tr className="global_tr">
                    <td className="global_td text-center">Total</td>
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
        </div>

        {/* productWeightSummary */}
        <div className="my-4">
          <h4 className="global_heading">Product Weight Summary</h4>
          <div className="w-full overflow-auto">
            <table className="global_table">
              <thead className="global_thead">
                <tr className="global_tr">
                  <th className="global_th">no</th>
                  <th className="global_th">product Name</th>
                  <th className="global_th">total Weight</th>
                  <th className="global_th">total Qty Sold</th>
                  <th className="global_th">total Amount</th>
                </tr>
              </thead>
              <tbody className="global_tbody">
                {weight && weight.length > 0 ? (
                  weight.map((items, index) => (
                    <tr key={index} className="global_tr">
                      <td className="global_td">{index + 1}</td>

                      <td className="global_td">
                        {items?.productName || "N/A"}
                      </td>
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
              {weight && weight.length > 0 && (
                <tfoot className="text-green-700">
                  <tr className="global_tr">
                    <td className="global_td text-center">Total</td>
                    <td className="global_td text-center"></td>
                    <td className="global_td">
                      {(() => {
                        const totalWeight = weight.reduce(
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
                      {weight.reduce(
                        (sum, item) => sum + (item.totalQtySold || 0),
                        0
                      )}
                    </td>
                    <td className="global_td">
                      {weight.reduce(
                        (sum, item) => sum + (item.totalAmount || 0),
                        0
                      )}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      {/* Asm Summary  */}
      <div className="my-4 no-print no-download">
        <h4 className="global_heading">Asm Summary</h4>
        <div className="w-full overflow-auto">
          <table className="global_table">
            <thead className="global_thead">
              <tr className="global_tr">
                <th className="global_th">no</th>
                <th className="global_th">ASM Name</th>
                <th className="global_th">ASM Mobile</th>
                <th className="global_th">total Sale</th>
                <th className="global_th">total Discount</th>
                <th className="global_th">total Debit</th>
                <th className="global_th">total Credit</th>
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
                    <td className="global_td">{items?.totalSale || 0}</td>
                    <td className="global_td">{items?.totalDiscount || 0}</td>
                    <td className="global_td">{items?.totalDebit || 0}</td>
                    <td className="global_td">{items?.totalCredit || 0}</td>
                    <td className="global_td">{items?.totalGrand || 0}</td>
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
                  <td className="global_td">
                    {asmSummary.reduce(
                      (sum, item) => sum + (item.totalGrand || 0),
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

      {/*Mso Summary  */}

      <div className="my-4 no-print no-download">
        <h4 className="global_heading">Mso Summary</h4>
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
                <th className="global_th">total Credit</th>
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
                    <td className="global_td">{items?.totalSale || 0}</td>
                    <td className="global_td">{items?.totalDiscount || 0}</td>
                    <td className="global_td">{items?.totalDebit || 0}</td>
                    <td className="global_td">{items?.totalCredit || 0}</td>
                    <td className="global_td">{items?.totalGrand || 0}</td>
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
                  <td className="global_td">
                    {msoSummary.reduce(
                      (sum, item) => sum + (item.totalGrand || 0),
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
