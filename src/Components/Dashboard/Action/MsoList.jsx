import axios from "axios";
import { BaseURL } from "../../../Helper/Config";
import { getToken } from "../../../Helper/SessionHelper";
import loadingStore from "../../../Zustand/LoadingStore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";


export default function MsoList() {
  const {id}=useParams()
  const { getGlobalLoader } = loadingStore();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const {data} = await axios.get(`${BaseURL}/MSOByASM/${id}`, {
        headers: { token: getToken() },
      });
      setData(data)
    };
    fetchData()
  }, [id]);
  console.log(data)
  return <div>MsoList</div>;
}
