import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setCity } from '../redux/userSlice'
import axios from 'axios'

function useGetCity() {
    const dispatch = useDispatch()
    const { city } = useSelector((state) => state.user)
    const apiKey = import.meta.env.VITE_GEOAPIKEY

    useEffect(() => {
        if (city) return
        if (!navigator.geolocation) return

        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const latitude = position.coords.latitude
                const longitude = position.coords.longitude

                // Geoapify Reverse Geocoding API
                const result = await axios.get(
                    `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
                )

                const location = result.data.results[0]
                console.log("Geoapify Full Response:", location)

                // Exact location ke liye fields check karein
                let exactLocation = 
                    location.suburb || 
                    location.hamlet || 
                    location.village || 
                    location.town || 
                    location.city || 
                    location.county ||
                    location.district

                // Agar Geoapify me Thane ya district aaye, toh agar location data me koi aur choti jagah ho toh woh lein, 
                // ya agar aapko manually Bhiwandi set karna hai jab aap wahan ho:
                if (exactLocation && exactLocation.includes("Thane")) {
                    // Agar aap chahte hain ki Geoapify ke 'Thane' ko aap override karke Bhiwandi karein:
                    exactLocation = "Bhiwandi" 
                }

                if (exactLocation) {
                    dispatch(setCity(exactLocation))
                    console.log("Detected Location with Geoapify:", exactLocation)

                    // Backend par update karein
                    try {
                        await axios.post(
                            `${serverUrl}/api/user/update-city`,
                            { city: exactLocation },
                            { withCredentials: true }
                        )
                        console.log("✅ Location updated on backend")
                    } catch (err) {
                        console.log("❌ Backend update error:", err.response?.data || err.message)
                    }
                }
            } catch (error) {
                console.log("Error getting location:", error)
            }
        })
    }, [dispatch, city])
}

export default useGetCity