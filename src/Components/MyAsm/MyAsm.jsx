import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/Axios_Response_Interceptor";

export default function MyAsm() {
  const [asmData, setMyAsmData] = useState([]);

  const { setGlobalLoader } = loadingStore();

  useEffect(() => {
    const fetchAsmData = async () => {
      setGlobalLoader(true);
      try {
        const { data } = await api.get(`/ASM/0`);
        setMyAsmData(data);
      } catch (error) {
        console.error("Error fetching ASM data:", error);
      } finally {
        setGlobalLoader(false);
      }
    };

    fetchAsmData();
  }, []);

  return (
    <div className="global_container">
      {/* Table by asm list */}
      <div>
        <div>
          <h1 className="global_heading">My asm</h1>
          <div className="overflow-auto">
            <table className="global_table">
              <thead className="global_thead">
                <tr className="global_tr">
                  <th className="global_th">No</th>
                  <th className="global_th">Name</th>
                  <th className="global_th">Mobile Number</th>
                  <th className="global_th">Action</th>
                </tr>
              </thead>
              <tbody className="global_tbody">
                {asmData?.data && asmData?.data?.length > 0 ? (
                  asmData?.data?.map((items, index) => (
                    <tr key={index} className="global_tr">
                      <td className="global_td">{index + 1}</td>
                      <td className="global_td">{items?.name || "N/A"}</td>
                      <td className="global_td">{items?.mobile || "N/A"}</td>
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
                        <Link
                          to={`/salereportPage/${items._id}`}
                          className="global_button"
                        >
                          Sale Report
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-3 text-gray-500">
                      No Data Found
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
}
