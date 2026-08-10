import { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setCity, setAddress } from '../redux/userSlice'
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

                // ✅ Check karne ke liye coordinates console me print karein
                console.log("📍 GPS Coordinates:", latitude, longitude)

                const result = await axios.get(
                    `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
                )

                const location = result.data.results[0]
                
                // ✅ Raw location object check karne ke liye
                console.log("🔍 Geoapify Full Location Data:", location)

                let exactLocation = 
                    location.suburb || 
                    location.hamlet || 
                    location.village || 
                    location.town || 
                    location.city || 
                    location.county ||
                    location.district

                // ✅ Final detected exact location console me print hogi
                console.log("🎯 Exact Detected Location:", exactLocation)

                const addressLine1 = location.address_line1 || ""
                const addressLine2 = location.address_line2 || ""
                const fullAddress = addressLine1 + (addressLine2 ? ", " + addressLine2 : "")

                if (exactLocation) {
                    dispatch(setCity(exactLocation))
                    dispatch(setAddress(fullAddress)) 

                    try {
                        await axios.post(
                            `${serverUrl}/api/user/update-city`,
                            { city: exactLocation },
                            { withCredentials: true }
                        )
                        console.log("✅ Exact location updated on backend")
                    } catch (err) {
                        console.log("❌ Backend update error:", err.response?.data || err.message)
                    }
                }
            } catch (error) {
                console.log("Error getting location:", error)
            }
        })
    }, [dispatch, city])

    return { city }
}

export default useGetCity