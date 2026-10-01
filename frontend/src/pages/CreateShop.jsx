import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Store, UploadCloud, ArrowLeft, CheckCircle, MapPin, Building, Globe, Navigation, LocateFixed } from 'lucide-react';
import { serverUrl } from '../App';
import { setMyShopData } from '../redux/ownerSlice';
import useGetCity from '../hooks/useGetCity';

function CreateShop() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { myShopData } = useSelector((state) => state.owner);
  const { userData, city: reduxCity, address: reduxAddress } = useSelector((state) => state.user);

  useGetCity();

  const [name, setName] = useState(myShopData?.name || "");
  const [address, setAddress] = useState(myShopData?.address || reduxAddress || userData?.address || "");
  const [city, setCity] = useState(myShopData?.city || reduxCity || userData?.city || "Mumbai");
  const [state, setState] = useState(myShopData?.state || userData?.state || "Maharashtra");
  const [pincode, setPincode] = useState(myShopData?.pincode || userData?.pincode || "");
  const [shopCategory, setShopCategory] = useState(myShopData?.shopCategory || "");

  const [frontendImage, setFrontendImage] = useState(myShopData?.image || null);
  const [backendImage, setBackendImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [error, setError] = useState('');
  const [locationDetected, setLocationDetected] = useState(false);

  useEffect(() => {
    if (reduxCity) {
      setCity(reduxCity);
    } else if (userData?.city) {
      setCity(userData.city);
    }

    if (reduxAddress) {
      setAddress(reduxAddress);
    } else if (userData?.address) {
      setAddress(userData.address);
    }

    if (userData?.pincode) {
      setPincode(userData.pincode);
    }
  }, [reduxCity, reduxAddress, userData]);

  const detectLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("❌ Geolocation is not supported by your browser");
      return;
    }

    setDetectingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );

          if (res.data && res.data.address) {
            const addr = res.data.address;
            const detectedCity = addr.city || addr.town || addr.village || addr.municipality || addr.county || "";
            const detectedState = addr.state || addr.region || "";
            const detectedPincode = addr.postcode || "";
            const roadName = addr.road || "";
            const houseNumber = addr.house_number || "";
            const suburb = addr.suburb || "";

            let fullAddress = "";
            if (houseNumber) fullAddress += houseNumber + ", ";
            if (roadName) fullAddress += roadName + ", ";
            if (suburb) fullAddress += suburb + ", ";
            fullAddress += detectedCity || "";

            if (detectedCity) {
              setCity(detectedCity);
              setState(detectedState);
              setAddress(fullAddress);
              setPincode(detectedPincode);
              setLocationDetected(true);
            }
          }
        } catch (err) {
          console.error("Error fetching location:", err);
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        setDetectingLocation(false);
        alert("Location access denied or unavailable.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackendImage(file);
      setFrontendImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address.trim() || !name.trim()) {
      setError("Please fill Name and Address.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', name);
      formDataToSend.append('city', city);
      formDataToSend.append('state', state);
      formDataToSend.append('address', address);
      if (pincode) formDataToSend.append('pincode', pincode);
      if (shopCategory) formDataToSend.append('shopCategory', shopCategory);
      if (backendImage) formDataToSend.append('image', backendImage);

      const token = localStorage.getItem('token');
      const res = await axios.post(`${serverUrl}/api/shop/create-edit`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true,
      });

      if (res.data?.success) {
        dispatch(setMyShopData(res.data.shop));
        alert("🎉 Shop created successfully!");
        navigate('/home');
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create shop.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 py-10 px-4 flex justify-center items-start relative overflow-hidden">
      <div className="pointer-events-none fixed -right-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-32 -left-32 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 border border-slate-800 relative z-10">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/home')} className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Store size={20} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Create Your Shop</h2>
              <p className="text-xs text-slate-400">Register your seafood business on AquaMart</p>
            </div>
          </div>

          <button
            type="button"
            onClick={detectLiveLocation}
            disabled={detectingLocation}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition border ${
              locationDetected 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20'
            }`}
          >
            <LocateFixed size={13} className={detectingLocation ? "animate-spin" : ""} />
            {detectingLocation ? "Detecting..." : locationDetected ? "📍 GPS Locked" : "Detect Location"}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* Shop Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Shop Name *</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fresh Catch Aqua Mart" 
              required
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Shop Image */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Shop Banner Image</label>
            <div className="border border-dashed border-slate-700 hover:border-cyan-500/50 rounded-2xl p-4 text-center transition-colors cursor-pointer relative bg-slate-950/50">
              <input type="file" accept="image/*" onChange={handleImage} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              {frontendImage ? (
                <img src={frontendImage} alt="Shop Preview" className="h-28 w-auto mx-auto rounded-xl object-cover border border-slate-700" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500 py-3">
                  <UploadCloud size={28} className="text-cyan-400" />
                  <span className="text-xs text-slate-400">Click to upload shop front photo</span>
                </div>
              )}
            </div>
          </div>

          {/* City & State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">City *</label>
              <input 
                type="text" 
                value={city} 
                onChange={(e) => setCity(e.target.value)}
                placeholder="Mumbai" 
                required
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">State *</label>
              <input 
                type="text" 
                value={state} 
                onChange={(e) => setState(e.target.value)}
                placeholder="Maharashtra" 
                required
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Category & Pincode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Shop Specialty</label>
              <input 
                type="text" 
                value={shopCategory} 
                onChange={(e) => setShopCategory(e.target.value)}
                placeholder="e.g. Fresh Fish & Prawns" 
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Pincode</label>
              <input 
                type="text" 
                value={pincode} 
                onChange={(e) => setPincode(e.target.value)}
                placeholder="400001" 
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Complete Shop Address *</label>
            <textarea 
              value={address} 
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Shop No, Fish Market Road, Landmark" 
              required
              rows={2}
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Publishing Shop..." : "Publish Shop on AquaMart"}
          </button>

        </form>

      </div>
    </div>
  );
}

export default CreateShop;