import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { serverUrl } from "../App";
import { setItems } from "../redux/userSlice"; // Apne Redux slice path ke mutabiq check karein

export function useGetItemByCity() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAllItems = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/item/all-items`);
        if (res.data?.success) {
          dispatch(setItems(res.data.items));
        }
      } catch (err) {
        console.error("Error fetching all items:", err);
      }
    };

    fetchAllItems();
  }, [dispatch]);
}

export default useGetItemByCity;