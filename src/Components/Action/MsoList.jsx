import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import loadingStore from "../../Zustand/LoadingStore";
import api from "../../Helper/Axios_Response_Interceptor";

export default function MsoList() {
  const { id } = useParams();
  const { setGlobalLoader } = loadingStore();
  const [data, setData] = useState([]);

  useEffect(() => {
    setGlobalLoader(true);
    try {
      const fetchData = async () => {
        const { data } = await api.get(`/MSO/${id}`);
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
            {data?.data && data?.data.length > 0 ? (
              data?.data.map((items, index) => (
                <tr key={index} className="global_tr">
                  <td className="global_td">{index + 1}</td>
                  <td className="global_td">{items?.name || "N/A"}</td>
                  <td className="global_td">{items?.mobile || 0}</td>
                  <td className="global_td">{items?.role || 0}</td>
                  <td className="global_td space-x-2">
                    <Link
                      to={`/MSOReport/${items?._id}`}
                      className="global_button"
                    >
                      Report
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
