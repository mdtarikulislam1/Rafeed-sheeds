import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import loadingStore from "../../Zustand/LoadingStore";

export default function Asm() {
  const { setGlobalLoader } = loadingStore();
  const [data, setData] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      setGlobalLoader(true); 
      try {
        const { data } = await axios.get(`${BaseURL}/GetASMbyRSM/${id}`, {
          headers: { token: getToken() },
        });
        setData(data);
      } catch (error) {
        console.error("Error fetching ASM data:", error);
      } finally {
        setGlobalLoader(false); 
      }
    };

    fetchData();
  }, [id]); 

  return (
    <div>
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
            <tbody className=" global_tbody">
              {data?.ASMList?.map((items, index) => (
                <tr key={index} className="global_tr">
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
