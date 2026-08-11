import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 🔥 API Key (Aapke .env se aayega)
const apiKey = import.meta.env.VITE_GEOAPIKEY;

// ==========================================
// ASYNC THUNKS (API Calls)
// ==========================================

// 1️⃣ Get Current Location from GPS & Reverse Geocode to Address
export const fetchCurrentLocation = createAsyncThunk(
  "map/fetchCurrentLocation",
  async (_, { rejectWithValue }) => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation is not supported by your browser.");
      } else {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              
              // Reverse Geocode: Lat/Lng to Address
              const response = await axios.get(
                `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
              );
              
              const location = response.data.results[0];
              const addressLine1 = location.address_line1 || "";
              const addressLine2 = location.address_line2 || "";
              const fullAddress = addressLine1 + (addressLine2 ? ", " + addressLine2 : "");

              resolve({
                latitude,
                longitude,
                address: fullAddress || "Location detected",
                city: location.city || location.town || location.district || "Unknown"
              });
            } catch (error) {
              reject(error.message);
            }
          },
          (error) => {
            reject(error.message);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    });
  }
);

// 2️⃣ Forward Geocode: Address to Lat/Lng (Map ko shift karne ke liye)
export const searchAddress = createAsyncThunk(
  "map/searchAddress",
  async (query, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&format=json&apiKey=${apiKey}`
      );

      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          latitude: result.lat,
          longitude: result.lon,
          address: result.address_line1 || query,
        };
      } else {
        throw new Error("Location not found");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ==========================================
// SLICE
// ==========================================
const initialState = {
  latitude: 19.0760,      // Default: Mumbai
  longitude: 72.8777,
  address: "Mumbai, Maharashtra, India",
  city: "Mumbai",
  isLocating: false,
  error: null,
  lastUpdated: null,
};

const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    // Manual updates
    setLocation: (state, action) => {
      state.latitude = action.payload.latitude;
      state.longitude = action.payload.longitude;
      state.lastUpdated = new Date().toISOString();
    },
    setAddress: (state, action) => {
      state.address = action.payload;
    },
    setCity: (state, action) => {
      state.city = action.payload;
    },
    resetMap: (state) => {
      state.latitude = 19.0760;
      state.longitude = 72.8777;
      state.address = "Mumbai, Maharashtra, India";
      state.city = "Mumbai";
      state.isLocating = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Current Location
      .addCase(fetchCurrentLocation.pending, (state) => {
        state.isLocating = true;
        state.error = null;
      })
      .addCase(fetchCurrentLocation.fulfilled, (state, action) => {
        state.isLocating = false;
        state.latitude = action.payload.latitude;
        state.longitude = action.payload.longitude;
        state.address = action.payload.address;
        state.city = action.payload.city;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchCurrentLocation.rejected, (state, action) => {
        state.isLocating = false;
        state.error = action.payload || "Failed to get location";
      })
      // Search Address
      .addCase(searchAddress.pending, (state) => {
        state.isLocating = true;
      })
      .addCase(searchAddress.fulfilled, (state, action) => {
        state.isLocating = false;
        state.latitude = action.payload.latitude;
        state.longitude = action.payload.longitude;
        state.address = action.payload.address;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(searchAddress.rejected, (state, action) => {
        state.isLocating = false;
        state.error = action.payload || "Address search failed";
      });
  },
});

export const { setLocation, setAddress, setCity, resetMap } = mapSlice.actions;
export default mapSlice.reducer;