import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Store, UploadCloud, ArrowLeft, CheckCircle, MapPin, Building, Globe, Navigation } from 'lucide-react';
import { serverUrl } from '../App';
import { setMyShopData } from '../redux/ownerSlice';
import useGetCity from '../hooks/useGetCity';

function CreateShop() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { myShopData } = useSelector((state) => state.owner);
  const { userData, city: reduxCity, address: reduxAddress } = useSelector((state) => state.user);

  // Hook call to fetch city/address if not already present
  useGetCity();

  const [name, setName] = useState(myShopData?.name || "");
  const [address, setAddress] = useState(myShopData?.address || reduxAddress || userData?.address || "");
  const [city, setCity] = useState(myShopData?.city || reduxCity || userData?.city || "Mumbai");
  const [state, setState] = useState(myShopData?.state || userData?.state || "Maharashtra");
  const [shopCategory, setShopCategory] = useState(myShopData?.shopCategory || "");

  const [frontendImage, setFrontendImage] = useState(myShopData?.image || null);
  const [backendImage, setBackendImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [error, setError] = useState('');

  // ✅ Admin/User dashboard ki saved city & address se form ko sync karne ke liye
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
  }, [reduxCity, reduxAddress, userData]);

  // ✅ Live Location Detect Button (Agar browser se GPS coordinates lene hon)
  const detectLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (res.data && res.data.address) {
            const addr = res.data.address;
            const detectedCity = addr.city || addr.town || addr.village || addr.county || "";
            const detectedState = addr.state || "";
            const fullRoadAddress = res.data.display_name || "";

            if (detectedCity) setCity(detectedCity);
            if (detectedState) setState(detectedState);
            if (fullRoadAddress) setAddress(fullRoadAddress);
            
            alert("Live location fetched successfully!");
          }
        } catch (err) {
          console.error("Error fetching location details:", err);
          setError("Failed to fetch address from coordinates.");
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        console.error(error);
        setDetectingLocation(false);
        alert("Unable to retrieve your location. Please allow location permissions.");
      },
      { enableHighAccuracy: true }
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
      formDataToSend.append('shopCategory', shopCategory);

      if (backendImage) {
        formDataToSend.append('image', backendImage);
      }

      const res = await axios.post(
        `${serverUrl}/api/shop/create-shop`,
        formDataToSend,
        { withCredentials: true }
      );

      if (res.data.success) {
        dispatch(setMyShopData(res.data.shop));
        alert('Shop created/updated successfully!');
        navigate('/home');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create shop. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex justify-center items-start">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 border border-gray-100">
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/home')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Store size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Create Your Shop</h2>
              <p className="text-sm text-gray-500">Start selling fresh seafood today!</p>
            </div>
          </div>

          <button
            type="button"
            onClick={detectLiveLocation}
            disabled={detectingLocation}
            className="flex items-center gap-1.5 px-3 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-semibold rounded-lg transition border border-cyan-200"
          >
            <Navigation size={14} className={detectingLocation ? "animate-spin" : ""} />
            {detectingLocation ? "Detecting..." : "Detect Live Location"}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Shop Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Shop Name *</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fresh Catch Aqua Mart" 
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Shop Image</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer relative">
              <input type="file" accept="image/*" onChange={handleImage} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              {frontendImage ? (
                <img src={frontendImage} alt="Shop Preview" className="h-24 w-auto mx-auto rounded object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <UploadCloud size={32} />
                  <span className="text-sm">Click to upload shop image</span>
                </div>
              )}
            </div>
          </div>

          {/* City & State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">City *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Mumbai" 
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">State *</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  value={state} 
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Maharashtra" 
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Address *</label>
            <input 
              type="text" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Shop No, Street, Area" 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Shop Category */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Shop Category</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                list="shopCategories"
                value={shopCategory}
                onChange={(e) => setShopCategory(e.target.value)}
                placeholder="Type or select category (e.g. Fresh Fish)"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
              <datalist id="shopCategories">
                <option value="Fresh Fish" />
                <option value="Dry Fish" />
              </datalist>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Creating Shop...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Create Shop
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}

export default CreateShop;