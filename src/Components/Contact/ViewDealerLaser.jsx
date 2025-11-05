import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ErrorToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import { FaCalendarAlt } from "react-icons/fa";
import { createPortal } from "react-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { printElement } from "../../Helper/Printer";
import TimeAgo from "../../Helper/UI/TimeAgo";
import { getDateRange } from "../../Helper/dateRangeHelper";
import api from "../../Helper/Axios_Response_Interceptor";

const ViewDealerLaser = () => {
  const { id } = useParams();
  const [laser, setLaser] = useState(null);
  const { setGlobalLoader } = loadingStore();

  const [dateInitialized, setDateInitialized] = useState(false);
  const [selectedRange, setSelectedRange] = useState("This Year");

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30))
  ); // last 30 days default
  const [endDate, setEndDate] = useState(new Date());
  const printRef = useRef(null);

  const formatDate = (date, endOfDay = false) => {
    const d = new Date(date);
    if (endOfDay) d.setHours(23, 59, 59, 999);
    else d.setHours(0, 0, 0, 0);

    const bdOffset = 6 * 60; // minutes
    const utc = d.getTime() + d.getTimezoneOffset() * 60000;
    const bdTime = new Date(utc + bdOffset * 60000);

    return bdTime.toISOString();
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/GetCategory");
      if (data?.status === "Success") {
        setCategories(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDealerLaser = async () => {
    const start = formatDate(startDate, false); // 00:00:00
    const end = formatDate(endDate, true); // 23:59:59

    try {
      setGlobalLoader(true);
      const { data } = await api.get(`/DealerLaser/${id}/${start}/${end}`);
      if (data?.status === "Success") {
        setLaser(data);
      } else {
        ErrorToast("Data not found");
      }
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
    fetchCategories();
  }, []);

  useEffect(() => {
    if (dateInitialized) {
      fetchDealerLaser();
    }
  }, [id, startDate, endDate]);

  // totals
  const totalInvoice =
    laser?.data?.reduce((sum, t) => sum + (t.Credit || 0), 0) || 0;
  const totalReceived =
    laser?.data?.reduce((sum, t) => sum + (t.Debit || 0), 0) || 0;
  const closingBalance = laser?.contactDetails?.ClosingBalance || 0;
  const totalDiscount =
    laser?.data?.reduce((sum, t) => sum + (parseInt(t.discount) || 0), 0) || 0;

  const filteredData =
    selectedCategory === "All"
      ? laser?.data || []
      : laser?.data?.filter((t) => t.CategoryID === selectedCategory) || [];

  return (
    <div className="p-2" ref={printRef}>
      <h1 className="text-xl font-semibold mb-2">Dealer Transactions Report</h1>

      {/* Dealer Info */}
      <div className="mb-2 space-y-1 global_sub_container flex justify-between">
        <div>
          {laser?.data?.[0]?.dealerDetails?.name && (
            <h2 className="user-name">
              Name: {laser.data[0].dealerDetails.name}
            </h2>
          )}
          {laser?.data?.[0]?.dealerDetails?.proprietor && (
            <p className="user-mobile">
              Proprietor: {laser.data[0].dealerDetails.proprietor}
            </p>
          )}
          {laser?.data?.[0]?.dealerDetails?.mobile && (
            <p className="user-mobile">
              Mobile: {laser.data[0].dealerDetails.mobile}
            </p>
          )}
          {laser?.data?.[0]?.dealerDetails?.address && (
            <address className="user-mobile">
              Address: {laser.data[0].dealerDetails.address}
            </address>
          )}
        </div>

        <p
          className={`font-medium ${
            closingBalance < 0 ? "text-red-600" : "text-green-400"
          }`}
        >
          {closingBalance < 0
            ? `Receivable Balance: ${Math.abs(closingBalance).toLocaleString()}`
            : `Payable Balance: ${closingBalance.toLocaleString()}`}
        </p>
      </div>

      {/* Date & Category Filter */}
      <div
        id="no-print"
        className="flex flex-col lg:flex-row justify-between mb-4 gap-4"
      >
        {/* Date Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm">Date Range</label>
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
                "This Year",
                "This Month",
                "This Week",
                "Last Week",
                "Last Month",
                "Last Year",
              ].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm">Start Date</label>
            <div className="relative w-full">
              <FaCalendarAlt className="absolute left-3 top-3" />
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="dd-MM-yyyy"
                className="global_input pl-10 w-full"
                popperContainer={(props) =>
                  createPortal(<div {...props} />, document.body)
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm">End Date</label>
            <div className="relative w-full">
              <FaCalendarAlt className="absolute left-3 top-3" />
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="dd-MM-yyyy"
                className="global_input pl-10 w-full"
                popperContainer={(props) =>
                  createPortal(<div {...props} />, document.body)
                }
              />
            </div>
          </div>
        </div>

        {/* Category Filter - justify end */}
        <div className="flex justify-end w-full lg:w-auto">
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="global_dropdown min-w-40"
            >
              <option value="All">All</option>
              {categories
                .filter((cat) =>
                  laser?.data?.some((t) => t.CategoryID === cat._id)
                )
                .map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="global_table">
          <thead className="global_thead">
            <tr>
              <th className="global_th">#</th>
              <th className="global_th">Date</th>
              <th className="global_th">Type</th>
              <th className="global_th text-right">Invoice</th>
              <th className="global_th">Discount</th>
              <th className="global_th text-right">Net Amount</th>
              <th className="global_th text-right">Received</th>
              <th className="global_th text-right">Closing Balance</th>
              <th id="no-print" className="global_th">
                Details
              </th>
            </tr>
          </thead>

          <tbody className="global_tbody">
            {filteredData.length > 0 ? (
              filteredData.map((t, i) => (
                <tr key={t._id} className="global_tr">
                  <td className="global_td">{i + 1}</td>
                  <td className="global_td">
                    <span className="mr-1">
                      {new Date(t.CreatedDate).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <TimeAgo date={t.CreatedDate} />
                  </td>
                  <td className="global_td">
                    {"saleID" in t && t?.saleID != null ? "Sale" : "Payment"}
                    {t?.remark && (
                      <span className="text-red-600 ml-1">({t.remark})</span>
                    )}
                  </td>
                  <td className="global_td text-right">
                    {(Number(t?.Credit) || 0) + (Number(t?.discount) || 0)}
                  </td>
                  <td className="global_td">{t.discount}</td>
                  <td className="global_td text-right">
                    {t.Credit.toFixed(2).toLocaleString("en-IN")}
                  </td>
                  <td className="global_td text-right">
                    {t.Debit.toFixed(2).toLocaleString("en-IN")}
                  </td>
                  <td
                    className={
                      "global_td " +
                      (t.TotalDebit - t.TotalCredit > 0
                        ? "text-red-400"
                        : t.TotalDebit - t.TotalCredit < 0
                        ? "text-green-500"
                        : "")
                    }
                  >
                    {t.TotalDebit - t.TotalCredit > 0
                      ? `Payable: ${(t.TotalDebit - t.TotalCredit).toFixed(2)}`
                      : t.TotalDebit - t.TotalCredit < 0
                      ? `Receivable: ${Math.abs(
                          t.TotalDebit - t.TotalCredit
                        ).toFixed(2)}`
                      : "0.00"}
                  </td>
                  <td id="no-print" className="global_td">
                    {t.saleID && (
                      <Link
                        to={`/SaleDetails/${t.saleID}`}
                        className="global_button"
                      >
                        View
                      </Link>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-4 text-gray-500">
                  No records found
                </td>
              </tr>
            )}
          </tbody>

          {filteredData.length > 0 && (
            <tfoot>
              <tr className="global_tr">
                <td className="global_td" colSpan="3">
                  Total Amount:
                </td>
                <td className="global_td">{totalInvoice.toFixed(2)}</td>
                <td className="global_td">{totalDiscount}</td>
                <td className="global_td">
                  {(Number(totalInvoice) || 0) - (Number(totalDiscount) || 0)}
                </td>
                <td className="global_td">{totalReceived.toFixed(2)}</td>
                <td className="global_td">
                  {closingBalance < 0 ? (
                    <span className="text-green-500">Ending Receivable</span>
                  ) : (
                    <span>Payable</span>
                  )}{" "}
                  : {Math.abs(closingBalance).toLocaleString()}
                </td>
                <td id="no-print" className="global_td"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => printElement(printRef, "Dealer Laser")}
          className="global_button mt-5"
          id="no-print"
        >
          Print
        </button>
      </div>
    </div>
  );
};

export default ViewDealerLaser;
