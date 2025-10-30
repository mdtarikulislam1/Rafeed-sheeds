import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ErrorToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { FaCalendarAlt } from "react-icons/fa";

import { createPortal } from "react-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { printElement } from "../../Helper/Printer";
import TimeAgo from "../../Helper/UI/TimeAgo";
import { getDateRange } from "../../Helper/dateRangeHelper";

const ViewSupplierLaser = () => {
  const { id } = useParams(); // শুধু supplier ID আসবে
  const [laser, setLaser] = useState(null);
  const { setGlobalLoader } = loadingStore();
  // const []
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .slice(0, 10)
  ); // default: last 30 days
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const printRef = useRef(null);
  const formatDate = (date, endOfDay = false) => {
    const d = new Date(date);
    if (endOfDay) {
      d.setHours(23, 59, 59, 999);
    } else {
      d.setHours(0, 0, 0, 0);
    }
    return d.toISOString(); // backend এ পাঠানোর জন্য ready
  };

  const fetchSupplierLaser = async () => {
    const start = formatDate(startDate, false); // 00:00:00
    const end = formatDate(endDate, true); // 23:59:59

    try {
      setGlobalLoader(true);
      const res = await axios.get(
        `${BaseURL}/SupplierLaser/${id}/${start}/${end}`,
        { headers: { token: getToken() } }
      );
      if (res?.data) {
        setLaser(res.data);
      }
    } catch (error) {
      ErrorToast(error.message);
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    if (id && startDate && endDate) {
      fetchSupplierLaser();
    }
  }, [id, startDate, endDate]);

  // total calculation
  const totalInvoice =
    laser?.data?.reduce((sum, t) => sum + (t.Credit || 0), 0) || 0;
  const totalReceived =
    laser?.data?.reduce((sum, t) => sum + (t.Debit || 0), 0) || 0;
  const closingBalance = laser?.contactDetails?.ClosingBalance || 0;



  return (
    <div className="p-6" ref={printRef}>
      <h1 className="text-xl font-semibold mb-4">
        Supplier Transactions Report
      </h1>

      {/* Supplier Info */}
      {laser?.contactDetails && (
        <div className="mb-6 space-y-1 global_sub_container flex justify-between">
          <div>
            {laser?.contactDetails?.company ? (
              <h2 className="user-name">
                Company: {laser?.contactDetails?.company}
              </h2>
            ) : (
              ""
            )}
            {laser?.contactDetails?.supplier ? (
              <p className="user-mobile">
                Name: {laser?.contactDetails?.supplier}
              </p>
            ) : (
              ""
            )}

            {laser?.contactDetails?.mobile ? (
              <p className="user-mobile">
                Mobile: {laser.contactDetails.mobile}
              </p>
            ) : (
              ""
            )}
            {laser?.contactDetails?.address ? (
              <address className="user-mobile">
                {laser?.contactDetails?.address}
              </address>
            ) : (
              ""
            )}
          </div>
          <p
            className={`font-medium ${
              closingBalance < 0 ? "text-red-600" : "text-green-400"
            } `}
          >
            {closingBalance < 0
              ? `Receivable Closing Balance: ${Math.abs(
                  closingBalance
                ).toLocaleString()}`
              : `Payable Closing Balance: ${closingBalance.toLocaleString()}`}
          </p>
        </div>
      )}

      {/* Date & filter */}
      <div className="flex flex-col lg:flex-row justify-between">
        <div className="flex items-end mb-4">
          {" "}
          <select
            onChange={(e) => {
              const { start, end } = getDateRange(e.target.value);
              setStartDate(start);
              setEndDate(end);
            }}
            className="global_dropdown"
          >
            {[
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="global_table">
          <thead className="global_thead">
            <tr>
              <th className="global_th">#</th>
              <th className="global_th">Date</th>
              <th className="global_th">Type</th>
              <th className="global_th">Discount</th>
              <th className="global_th text-right">Invoice</th>
              <th className="global_th text-right">Received</th>
              <th className="global_th text-right">Closing Balance</th>
              <th className="global_th">Note</th>
              {/* <th className="global_th">Details</th> */}
            </tr>
          </thead>
          <tbody className="global_tbody">
            {laser?.data?.length > 0 ? (
              laser.data.map((t, i) => (
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
                    {"saleID" in (t || {}) && t?.saleID != null
                      ? "Sale"
                      : "Payable"}
                  </td>
                  <td className="global_td">{t.Discount}</td>
                  <td className="global_td">{t.Credit.toFixed(2)}</td>
                  <td className="global_td">{t.Debit.toFixed(2)}</td>
                  <td className="global_td">
                    {t.suppliersDetails?.ClosingBalance < 0 ? (
                      <span className="text-red-500">Receivable : </span>
                    ) : (
                      <span>Payable : </span>
                    )}
                    {Math.abs(
                      t.suppliersDetails?.ClosingBalance || 0
                    ).toLocaleString() || 0}
                  </td>
                  <td className="global_td">{t.note}</td>
                  {/* <td className="global_td"><Link>{}</Link></td> */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No records found
                </td>
              </tr>
            )}
          </tbody>

          {/* Totals Row */}
          {laser?.data?.length > 0 && (
            <tfoot>
              <tr className="global_tr">
                <td className="global_td text-right" colSpan="4">
                  Total Amount:
                </td>
                <td className="global_td">{totalInvoice.toFixed(2)}</td>
                <td className="global_td">{totalReceived.toFixed(2)}</td>
                <td className="global_td">
                  {closingBalance < 0 ? (
                    <span className="text-red-500">Receivable</span>
                  ) : (
                    <span>Payable</span>
                  )}{" "}
                  : {Math.abs(closingBalance).toLocaleString()}
                </td>
                <td className="global_td"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <button
        onClick={() => {
          printElement(printRef, "any");
        }}
        className="global_button mt-5"
        id="no-print"
      >
        Print
      </button>
    </div>
  );
};

export default ViewSupplierLaser;
