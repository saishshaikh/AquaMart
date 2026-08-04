import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

import { serverUrl } from "../App";
import { setUserData } from "../redux/userSlice";

function useGetCity() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  const apiKey = import.meta.env.VITE_GEOAPIKEY;

  useEffect(() => {
    console.log("Checking user:", userData);

    // User login check
    if (!userData?.id && !userData?._id) {
      console.log("User not logged in");
      return;
    }

    // City already saved
    if (userData?.city) {
      console.log("City already exists:", userData.city);
      return;
    }

    if (!navigator.geolocation) {
      console.log("Geolocation is not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          console.log("Latitude:", latitude);
          console.log("Longitude:", longitude);

          const { data } = await axios.get(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
          );

          const location = data.results[0];

          const city =
            location.city ||
            location.town ||
            location.village ||
            location.suburb ||
            location.county;

          console.log("Detected City:", city);

          const response = await axios.post(
            `${serverUrl}/api/user/update-city`,
            { city },
            {
              withCredentials: true,
            }
          );

          console.log("Backend Response:", response.data);

          if (response.data.success) {
            dispatch(setUserData(response.data.user));
          }
        } catch (error) {
          console.log(error);
        }
      },
      (error) => {
        console.log("Location Error:", error.message);
      }
    );
  }, [userData?.id, userData?._id, userData?.city]);

  return null;
}

export default useGetCity;