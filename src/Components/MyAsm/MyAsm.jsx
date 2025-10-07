import axios from "axios";
import React, { useEffect, useState } from "react";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";

export default function MyAsm() {
  const [asmData, setMyAsmData] = useState([]);
  useEffect(() => {
    const fetchAsmData = async () => {
      try {
        const {data} = await axios.get(`${BaseURL}/MyASM`, {
          headers: { token: getToken() },
        });
        console.log(data?.data);
        setMyAsmData(data);
      } catch (error) {
        console.error("Error fetching ASM data:", error);
      }
    };

    fetchAsmData();
  }, []);

  console.log(asmData?.data)
  return (
    <div className="global_container">
      {/* Table by asm list */}
      <div>
        {asmData?.length == 0 ? (
          <div>
            <p className="text-lg text-red-600">No asm found</p>
          </div>
        ) : (
          <div>
            <div className=" overflow-auto">
                <table className="global_table w-full">
                    <thead>
                     <th className="global_th">No</th>
                     <th className="global_th">Mobile Number</th>
                     <th className="global_th">Name</th>
                     <th className="global_th">Active</th>
                    </thead>
                    {
                        asmData?.data?.map((items,index)=> (
                            <tr className="global_tr"  key={index}>
                                <td className="global_td">{index+1 || ''}</td>
                                <td className="global_td">{items?.mobile || ''}</td>
                                <td className="global_td">{items?.name || ''}</td>
                                <td className="global_td text-green-600">{items?.active === 0 ? 'inActive' : 'Active'}</td>
                            </tr>
                        ))
                    }
                </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
