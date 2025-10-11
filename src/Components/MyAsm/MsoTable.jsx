import axios from "axios";
import React, { useEffect, useState } from "react";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";

export default function MsoTable() {
  const [data, setData] = useState([]);
  
  const { setGlobalLoader } = loadingStore();

  useEffect(() => {
    const fetchData = async () => {
      setGlobalLoader(true)
      try {
        const { data } = await axios.get(`${BaseURL}/GetMSO`, {
          headers: { token: getToken() },
        });
        setData(data?.data);
      } catch (error) {
        console.error("Error fetching MSO data:", error);
      }finally{
        setGlobalLoader(false)
      }
    };

    fetchData();
  }, []);

  return (
    <div className="global_container">
      {data.length == 0 ? (
        <p className="text-red-600 text-xl font-bold text-center">
          Mso not Found
        </p>
      ) : (
        <div className="overflow-auto">
          <h4 className="global_heading">Mso List</h4>
          <table className="global_table w-full">
            <thead className="global_thead">
              <tr className="global_tr">
                <th className="global_th">No</th>
                <th className="global_th">name</th>
                <th className="global_th">mobile number</th>
                <th className="global_th">role</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((items, index) => (
                <tr className="global_tr" key={index}>
                  <td className="global_td">{index + 1}</td>
                  <td className="global_td">{items?.name}</td>
                  <td className="global_td">{items?.mobile}</td>
                  <td className="global_td">{items?.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
