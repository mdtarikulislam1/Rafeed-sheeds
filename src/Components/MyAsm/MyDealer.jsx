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
          <p className="global_no-data">
            Dealer not Found
          </p>
        ) : (
          <div>
            <h4 className="global_heading">My Dealer</h4>
          </div>
        )}
      </div>
    </div>
  );
}
