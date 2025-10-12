import React, { useEffect, useState } from "react";
import loadingStore from "../../Zustand/LoadingStore";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";

export default function MyDealer() {
  const { setGlobalLoader } = loadingStore();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setGlobalLoader(true);
      try {
        const { data } = await axios.get(`${BaseURL}/MyDealer`, {
          headers: { token: getToken() },
        });
        setData(data);
      } catch (error) {
        console.log(error);
      } finally {
        setGlobalLoader(false);
      }
    };
    fetchData();
  }, []);
  console.log(data);
  return (
    <div className="global_container">
      <div>
        {data?.length === 0 ? (
          <p className="global_no-data">Dealer not Found</p>
        ) : (
          <div>
            <h4 className="global_heading">My Dealer</h4>
            <div>
              <table className="global_table">
                <thead className="global_thead">
                  <tr className="global_tr">
                    <th className="global_th">no</th>
                    <th className="global_th">name</th>
                    <th className="global_th">mobile</th>
                    <th className="global_th">address</th>
                    <th className="global_th">proprietor</th>
                    <th className="global_th">totalBalance</th>
                    <th className="global_th">ID</th>
                    <th className="global_th">createdAt</th>
                    <th className="global_th">updatedAt</th>
                  </tr>
                </thead>

                <tbody className="global_tbody">
                  {data?.data?.map((items, index) => (
                    <tr key={index} className="global_tr">
                      <td className="global_td ">{index + 1}</td>
                      <td className="global_td ">
                        {items?.name ? items?.name : "N/A"}
                      </td>
                      <td className="global_td ">
                        {items?.mobile ? items?.mobile : "N/A"}
                      </td>
                      <td className="global_td ">
                        {items?.address ? items?.address : "N/A"}
                      </td>
                      <td className="global_td ">
                        {items?.proprietor ? items?.proprietor : "N/A"}
                      </td>
                      <td className="global_td ">
                        {items?.totalBalance ? items?.totalBalance : "N/A"}
                      </td>

                      <td className="global_td ">
                        {items?.ID ? items?.ID : "N/A"}
                      </td>
                      <td className="global_td ">
                        {items?.createdAt ? items?.createdAt : "N/A"}
                      </td>
                      <td className="global_td ">
                        {items?.updatedAt ? items?.updatedAt : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
