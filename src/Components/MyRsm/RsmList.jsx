import React, { useEffect, useState } from "react";
import loadingStore from "../../Zustand/LoadingStore";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { Link } from "react-router-dom";

export default function RsmList() {
  const { setGlobalLoader } = loadingStore();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
     setGlobalLoader(true);
      try {
        const response = await axios.get(`${BaseURL}/GetRSM`, {
          headers: { token: getToken() },
        });
        setData(response.data); // data data.data অনুযায়ী adjust করো
      } catch (error) {
        console.error(error);
      } finally {
        setGlobalLoader(false);
      }
    };

    fetchData();
  }, []);

  const items = Array.isArray(data?.data) ? data.data : [];

  return (
    <div className="overflow-auto">
      <h4 className="global_heading">Rsm List</h4>
      <table className="global_table">
        <thead className="global_thead">
          <tr className="global_tr">
            <th className="global_th">No</th>
            <th className="global_th">name</th>
            <th className="global_th">mobile</th>
            <th className="global_th">role</th>
            <th className="global_th">Action</th>

          </tr>
        </thead>
        {items.length === 0 ? (
          <tbody>
            <tr>
              <td colSpan={5} className="global_no-data">
                No Data Found
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody className="global_tbody">
            {items.map((item, index) => (
              <tr className="global_tr" key={index}>
                <td className="global_td">{index + 1}</td>
                <td className="global_td">{item?.name}</td>
                <td className="global_td">{item?.mobile}</td>
                <td className="global_td">{item?.role}</td>
                <td className="global_td space-x-2">
                    <Link className="global_button" to={`/rsm/report/${item?._id}`}>Report</Link>
                    <Link className="global_button" to={`/GetASMbyRSM/${item?._id}`}>Asm</Link>
                </td>
              </tr>
            ))}
          </tbody>
        )}
      </table>
    </div>
  );
}
