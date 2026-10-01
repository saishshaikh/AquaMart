import { useEffect } from 'react';
import { serverUrl } from '../App';
import { useDispatch, useSelector } from 'react-redux';
import { setCity, setAddress } from '../redux/userSlice';
import axios from 'axios';

function useGetCity() {
    const dispatch = useDispatch();
    const { city } = useSelector((state) => state.user);
    const apiKey = import.meta.env.VITE_GEOAPIKEY;

    useEffect(() => {
        if (city) return;
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;

                    console.log("📍 GPS Coordinates:", latitude, longitude);

                    // ✅ Try Geoapify API
                    let fullAddress = '';
                    let exactCity = '';
                    let exactState = '';
                    let exactPincode = '';
                    let streetName = '';

                    if (apiKey) {
                        const result = await axios.get(
                            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
                        );

                        const location = result.data.results[0];
                        console.log("🔍 Geoapify Full Location Data:", location);

                        // ✅ Extract ALL details
                        exactCity = location.city || location.town || location.village || location.municipality || location.county || location.district || "";
                        exactState = location.state || "";
                        exactPincode = location.postcode || "";
                        streetName = location.street || location.road || location.address_line1 || "";
                        const houseNumber = location.house_number || "";

                        // ✅ Build FULL ADDRESS
                        fullAddress = "";
                        if (houseNumber) fullAddress += houseNumber + ", ";
                        if (streetName) fullAddress += streetName + ", ";
                        if (exactCity) fullAddress += exactCity + ", ";
                        if (exactState) fullAddress += exactState + ", ";
                        if (exactPincode) fullAddress += exactPincode;

                        fullAddress = fullAddress.replace(/,\s*$/, '').trim();

                        console.log("🏠 Full Address:", fullAddress);
                        console.log("🎯 Exact City:", exactCity);
                        console.log("🏠 Street:", streetName);
                    }

                    // ✅ If no street/city found, try OpenStreetMap fallback
                    if (!streetName || !exactCity) {
                        console.log("🔄 Trying OpenStreetMap fallback...");
                        try {
                            const osmResult = await axios.get(
                                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
                            );

                            if (osmResult.data && osmResult.data.address) {
                                const addr = osmResult.data.address;
                                exactCity = exactCity || addr.city || addr.town || addr.village || addr.municipality || addr.city_district || addr.suburb || addr.neighbourhood || addr.state_district || addr.county || "";
                                exactState = exactState || addr.state || "";
                                exactPincode = exactPincode || addr.postcode || "";
                                streetName = streetName || addr.road || addr.street || addr.residential || addr.suburb || "";

                                const houseNumber = addr.house_number || "";
                                const displayName = osmResult.data.display_name || "";

                                // If exactCity is still empty, try extracting from displayName or state
                                if (!exactCity && displayName) {
                                    const parts = displayName.split(',').map(p => p.trim());
                                    if (parts.length >= 2) {
                                        exactCity = parts[parts.length - 3] || parts[parts.length - 2] || exactState || "Local Area";
                                    }
                                }

                                // Build full address from OSM
                                fullAddress = "";
                                if (houseNumber) fullAddress += houseNumber + ", ";
                                if (streetName) fullAddress += streetName + ", ";
                                if (exactCity) fullAddress += exactCity + ", ";
                                if (exactState) fullAddress += exactState + ", ";
                                if (exactPincode) fullAddress += exactPincode;

                                fullAddress = fullAddress.replace(/,\s*$/, '').trim();

                                // If still no street, use display_name
                                if (!streetName || streetName === exactCity) {
                                    fullAddress = displayName || fullAddress;
                                }

                                console.log("🌍 OSM Full Address:", fullAddress);
                            }
                        } catch (osmError) {
                            console.log("OSM fallback failed:", osmError);
                        }
                    }

                    // ✅ Update Redux with FULL ADDRESS
                    if (exactCity) {
                        dispatch(setCity(exactCity));
                        dispatch(setAddress(fullAddress || exactCity));

                        const token = localStorage.getItem("token");
                        if (token) {
                            try {
                                await axios.post(
                                    `${serverUrl}/api/user/update-location`,
                                    {
                                        city: exactCity,
                                        address: fullAddress,
                                        state: exactState,
                                        pincode: exactPincode,
                                        latitude: latitude,
                                        longitude: longitude
                                    },
                                    { 
                                        headers: { Authorization: `Bearer ${token}` },
                                        withCredentials: true 
                                    }
                                );
                                console.log("✅ Full location updated on backend");
                            } catch (err) {
                                console.log("❌ Backend update error:", err.response?.data || err.message);
                            }
                        }
                    } else {
                        console.log("⚠️ No city detected from location");
                    }
                } catch (error) {
                    console.log("Error getting location:", error);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
        );
    }, [dispatch, city]);

    return { city };
}

export default useGetCity;