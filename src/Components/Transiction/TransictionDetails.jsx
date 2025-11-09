import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ErrorToast, SuccessToast } from "../../Helper/FormHelper";
import loadingStore from "../../Zustand/LoadingStore";
import TimeAgo from "../../Helper/UI/TimeAgo";
import api from "../../Helper/Axios_Response_Interceptor";

const TransictionDetails = () => {
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [transactionList, setTransactionList] = useState([]);
  const { setGlobalLoader } = loadingStore();

  const fetchTransactionDetails = async () => {
    setGlobalLoader(true);
    try {
      const res = await api.get(`/GetPostTransactionById/${id}`);
      if (res.data.status === "Success") {
        setTransaction(res.data.transaction);
        setTransactionList(res.data.transactionList);
      } else {
        ErrorToast("Failed to fetch transaction details");
      }
    } catch (error) {
      ErrorToast("Something went wrong");
      console.error(error);
    } finally {
      setGlobalLoader(false);
    }
  };

  useEffect(() => {
    if (id) fetchTransactionDetails();
  }, [id]);

  const handleApprove = async () => {
    try {
      setGlobalLoader(true);
      const res = await api.get(`/ApproveTransaction/${id}`);
      if (res.data.status === "Success") {
        SuccessToast("Transaction Approved Successfully");
        setTransaction((prev) => ({ ...prev, status: "1" }));
        if (res.data.approvedTransactions) {
          setTransactionList(res.data.approvedTransactions);
        }
      } else {
        ErrorToast(res.data.message || "Approval failed");
      }
    } catch (error) {
      ErrorToast(error.message);
    } finally {
      setGlobalLoader(false);
    }
  };

  return (
    <div className="global_container">
      <div className="global_sub_container space-y-6">
        {/* Transaction Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Transaction Details
          </h1>
          {transaction && transaction.status === "0" && (
            <button
              onClick={handleApprove}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md mt-2 md:mt-0"
            >
              Approve
            </button>
          )}
        </div>

        {/* Transaction Info Cards */}
        {transaction ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500">Transaction ID</p>
              <p className="font-semibold text-gray-800 dark:text-white">
                {transaction.trxID}
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500">Bank</p>
              <p className="font-semibold text-gray-800 dark:text-white">
                {transaction.bankName}
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500">Total</p>
              <p className="font-semibold text-green-600 dark:text-green-400">
                {transaction.total}
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500">Posted By</p>
              <p className="font-semibold text-gray-800 dark:text-white">
                {transaction.postedBy}
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500">RSM / ASM</p>
              <p className="font-semibold text-gray-800 dark:text-white">
                {transaction.RSMName || "N/A"} / {transaction.ASMName || "N/A"}
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500">Posting Time</p>
              <p className="font-semibold text-gray-800 dark:text-white">
                {new Date(transaction.createdAt).toLocaleString()} •{" "}
                <TimeAgo date={transaction.createdAt} />
              </p>
            </div>
            <div className="p-4 col-span-1 md:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500">Note</p>
              <p className="text-gray-800 dark:text-white">
                {transaction.note || "—"}
              </p>
            </div>
            <div className="p-4 col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500">Status</p>
              <p
                className={`font-semibold ${
                  transaction.status === "1"
                    ? "text-green-500"
                    : "text-yellow-500"
                }`}
              >
                {transaction.status === "1" ? "Approved" : "Pending"}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Loading transaction...</p>
        )}

        {/* Transaction Items Table */}
        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Transaction Items
          </h2>
          <div className="overflow-auto w-full text-nowrap">
            <table className="global_table">
              <thead className="global_thead">
                <tr className="global_tr">
                  <th className="global_th">Dealer</th>
                  <th className="global_th">Category</th>
                  <th className="global_th">Amount</th>
                  {/* <th className="global_th">Money Receive No</th> */}
                </tr>
              </thead>
              <tbody className="global_tbody">
                {transactionList.length > 0 ? (
                  transactionList.map((item) => (
                    <tr
                      key={item._id}
                      className="global_tr"
                    >
                      <td className="global_td ">
                        <p className="font-medium text-nowrap">{item.dealerName}</p>
                        <p className="text-xs text-gray-500 ">
                          {item.dealerMobile} • {item.dealerAddress}
                        </p>
                      </td>
                      <td className="global_td">{item.categoryName}</td>
                      <td className="global_td">
                        {item.Debit}
                        {
                          console.log(item)
                        }
                      </td>
                      {/* <td className="global_td">{item.note}</td> */}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-4 py-4 text-center text-gray-500 dark:text-gray-400"
                    >
                      No transaction items found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransictionDetails;
