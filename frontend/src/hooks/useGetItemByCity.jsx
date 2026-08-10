import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setItems } from "../redux/userSlice"; // Apne project ke path ke mutabik check karein

export const useGetItemByCity = (city) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!city) return;

    const fetchItems = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/item/get-by-city?city=${city}`, {
          withCredentials: true,
        });

        // Yahan ensure karein ki array hi dispatch ho raha hai
        if (response.data) {
          const fetchedItems = response.data.items || response.data;
          dispatch(setItems(fetchedItems));
          console.log("Items successfully dispatched to Redux:", fetchedItems);
        }
      } catch (error) {
        console.error("Error fetching items by city:", error);
      }
    };

    fetchItems();
  }, [city, dispatch]);
};