import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { serverUrl } from "../App";
import { setItems } from "../redux/userSlice"; 

export function useGetItemByCity(city) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!city) return; // ✅ City na ho toh fetch mat karo

    const fetchAllItems = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${serverUrl}/api/item/all-items`);
        if (res.data?.success) {
          dispatch(setItems(res.data.items));
        }
      } catch (err) {
        console.error("Error fetching all items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllItems(); // ✅ Sirf city change hone par run hoga
  }, [city, dispatch]); // ✅ City change hone par hi fetch karo

  return { loading };
}

export default useGetItemByCity;