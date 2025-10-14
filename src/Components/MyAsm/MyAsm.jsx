import axios from "axios";
import React, { useEffect, useState } from "react";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";
import { Link } from "react-router-dom";
import loadingStore from "../../Zustand/LoadingStore";

export default function MyAsm() {
  const [asmData, setMyAsmData] = useState([]);

  const { setGlobalLoader } = loadingStore();

  useEffect(() => {
    const fetchAsmData = async () => {
      setGlobalLoader(true);
      try {
        const { data } = await axios.get(`${BaseURL}/ASM/0`, {
          headers: { token: getToken() },
        });
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
        {asmData?.length == 0 ? (
          <div>
            <p className="global_no-data">No asm found</p>
          </div>
        ) : (
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
                <tbody>
                  {asmData?.data?.map((items, index) => (
                    <tr className="global_tr" key={index}>
                      <td className="global_td">{index + 1 || "N/A"}</td>
                      <td className="global_td">
                        {items?.name ? items?.name : "N/A"}
                      </td>
                      <td className="global_td">
                        {items?.mobile ? items?.mobile : "N/A"}
                      </td>
                      <td className="global_td flex">
                        <Link
                          to={`/details/by/asm/${items?._id}`}
                          className="global_button"
                        >
                          Report
                        </Link>

                        <Link
                          to={`/MSOByASM/${items?._id}`}
                          className="global_button_red mx-4"
                        >
                          MSO
                        </Link>

                        <Link to="/my/dealer" className="global_button">
                          My Dealer
                        </Link>
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
