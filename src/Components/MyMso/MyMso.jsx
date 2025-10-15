import React, { useEffect, useState } from "react";
import loadingStore from "../../Zustand/LoadingStore";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { Link } from "react-router-dom";

export default function MyMso() {
  const { setGlobalLoader } = loadingStore();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setGlobalLoader(true);

      try {
        const { data } = await axios.get(`${BaseURL}/MSO/0`, {
          headers: { token: getToken() },
        });
        setData(data?.data);
      } catch (error) {
        console.error("Error fetching MSO data:", error);
      } finally {
        console.log("MSO data fetch attempt completed");
        setGlobalLoader(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <table className="global_table">
        <thead className="global_thead">
          <tr className="global_tr">
            <th className="global_th">No</th>
            <th className="global_th">name</th>
            <th className="global_th">mobile</th>
            <th className="global_th">role</th>
            <th className="global_th">action</th>
          </tr>
        </thead>
        <tbody className="global_tbody">
          {data && data.length > 0 ? (
            data?.map((items, index) => (
              <tr key={index} className="global_tr">
                <td className="global_td">{index + 1}</td>
                <td className="global_td">{items?.name || "N/A"}</td>
                <td className="global_td">{items?.mobile || 0}</td>
                <td className="global_td">{items?.role || 0}</td>
                <td className="global_td space-x-2">
                  <Link
                    to={`/MSOReport/${items?._id}`}
                    className="global_button"
                  >
                    Report
                  </Link>
                  <Link
                    to={`/DealerList/${items?._id}`}
                    className="global_button_red"
                  >
                    My Dealer
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-3 text-gray-500">
                No Data Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
