import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/Axios_Response_Interceptor";

export default function Asm() {
  const { setGlobalLoader } = loadingStore();
  const [data, setData] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      setGlobalLoader(true);
      try {
        const { data } = await api.get(`/GetASMbyRSM/${id}`);
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

      <div>
        <table className="global_table">
          <thead className="global_thead">
            <tr className="global_tr">
              <th className="global_th">No</th>
              <th className="global_th">name</th>
              <th className="global_th">mobile</th>
              <th className="global_th">Role</th>
              <th className="global_th">action</th>
            </tr>
          </thead>
          <tbody className="global_tbody">
            {data?.ASMList && data?.ASMList?.length > 0 ? (
              data?.ASMList?.map((items, index) => (
                <tr key={index} className="global_tr">
                  <td className="global_td">{index + 1}</td>

                  <td className="global_td">{items?.name || "N/A"}</td>
                  <td className="global_td">{items?.mobile || "N/A"}</td>
                  <td className="global_td">{items?.role || "N/A"}</td>
                  <td className="global_td space-x-2">
                    <Link
                      to={`/ASMReport/${items?._id}`}
                      className="global_button"
                    >
                      Report
                    </Link>

                    <Link
                      to={`/MSO/${items?._id}`}
                      className="global_button_red"
                    >
                      MSO
                    </Link>

                    <Link
                      to={`/DealerList/${items?._id}`}
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
        </table>
      </div>
    </div>
  );
}
