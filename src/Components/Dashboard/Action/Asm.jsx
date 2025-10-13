import React, { useEffect, useState } from "react";
import loadingStore from "../../../Zustand/LoadingStore";
import { useParams } from "react-router-dom";
import axios from "axios";
import { getToken } from "../../../Helper/SessionHelper";
import { BaseURL } from "../../../Helper/Config";

export default function Asm() {
  const { getGlobalLoader } = loadingStore();
  const [data, setData] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await axios.get(`${BaseURL}/GetASMbyRSM/${id}`, {
        headers: { token: getToken() },
      });
      setData(data);
    };
    fetchData();
  }, []);

  console.log(id);
  console.log(data);
  return (
    <div>
      {" "}
      <h4 className="global_heading">Asm List</h4>
      {data?.ASMList?.length === 0 ? (
        <p className="global_no-data">No Data Found</p>
      ) : (
        <div>
          <table className="global_table">
            <thead className="global_thead">
              <tr className="global_tr">
                <th className="global_th">No</th>
                <th className="global_th">name</th>
                <th className="global_th">mobile</th>
                <th className="global_th">Role</th>
              </tr>
            </thead>
            <tbody global_tbody>
              {data?.ASMList?.map((items, index) => (
                <tr className="global_tr">
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
