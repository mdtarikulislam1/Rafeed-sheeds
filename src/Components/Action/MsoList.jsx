import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import loadingStore from "../../Zustand/LoadingStore";
import { BaseURL } from "../../Helper/Config";
import { getToken } from "../../Helper/SessionHelper";

export default function MsoList() {
  const { id } = useParams();
  const { setGlobalLoader } = loadingStore();
  const [data, setData] = useState([]);

  useEffect(() => {
    setGlobalLoader(true);
    try {
      const fetchData = async () => {
        const { data } = await axios.get(`${BaseURL}/MSO/${id}`, {
          headers: { token: getToken() },
        });
        setData(data);
      };
      fetchData();
    } catch {
    } finally {
      setGlobalLoader(false);
    }
  }, [id]);

  return (
    <div>
      <h4 className="global_heading">Mso List</h4>
      {data?.length === 0 ? (
        <p className="global_no-data">No Data found</p>
      ) : (
        <div>
          <table className="global_table">
            <thead className="global_thead">
              <tr className="global_tr">
                <th className="global_th">NO</th>
                <th className="global_th">name</th>
                <th className="global_th">mobile</th>
                <th className="global_th">role</th>
                <th className="global_th">Action</th>
              </tr>
            </thead>
            <tbody className="global_tbody">
              {data?.data?.map((items, index) => (
                <tr key={index} className="global_tr">
                  <td className="global_td">{index + 1}</td>
                  <td className="global_td">{items?.name}</td>
                  <td className="global_td">{items?.mobile}</td>
                  <td className="global_td">{items?.role}</td>
                  <td className="global_td space-x-2">
                    <Link className="global_button" to={''}>Report</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
