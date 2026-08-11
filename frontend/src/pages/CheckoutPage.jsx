import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTruck, FaCreditCard, FaCheckCircle, FaBox, FaWallet, FaMapMarkerAlt, FaCrosshairs, FaMoneyBillWave } from 'react-icons/fa';
import { clearCart } from '../redux/userSlice';
import axios from 'axios';

// 🔥 Map Components Import
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 🔥 Fix for missing Leaflet marker icons in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// ✅ API Key & Server URL (Changed to 8000)
const apiKey = import.meta.env.VITE_GEOAPIKEY;
const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000'; // 🔥 FIXED PORT

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

// ==========================================
// 1. MAP CLICK COMPONENT
// ==========================================
function LocationMarker({ position, setPosition, setDeliveryAddress }) {
  const map = useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);

      try {
        const result = await axios.get(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apiKey}`
        );
        const location = result.data.results[0];
        const fullAddress = (location.address_line1 || "") + (location.address_line2 ? ", " + location.address_line2 : "");
        if (fullAddress) setDeliveryAddress(fullAddress);
      } catch (error) {
        console.error("Error fetching address:", error);
      }
      map.flyTo(e.latlng, map.getZoom());
    },
  });
  return position === null ? null : (
    <Marker position={position}>
      <Popup><strong>📍 Delivery Location</strong></Popup>
    </Marker>
  );
}

// ==========================================
// 2. AUTO MAP UPDATE COMPONENT
// ==========================================
function ChangeMapView({ coords }) {
  const map = useMap();
  useEffect(() => { if (coords) map.flyTo(coords, map.getZoom()); }, [coords, map]);
  return null;
}

// ==========================================
// 3. CHECKOUT PAGE COMPONENT
// ==========================================
const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false); // Button loading state
  
  const { cartitems } = useSelector((state) => state.user);

  const [position, setPosition] = useState({ lat: 19.0760, lng: 72.8777 });
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const totalPrice = cartitems.reduce((acc, item) => {
    const weightInGrams = item.quantity || 1000;
    const pricePerGram = item.price / 1000;
    return acc + (pricePerGram * weightInGrams);
  }, 0);

  const [paymentMethod, setPaymentMethod] = useState('cod');

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition({ lat: latitude, lng: longitude });
          setLoadingLocation(false);
          try {
            const result = await axios.get(
              `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
            );
            const location = result.data.results[0];
            const fullAddress = (location.address_line1 || "") + (location.address_line2 ? ", " + location.address_line2 : "");
            if (fullAddress) setDeliveryAddress(fullAddress);
          } catch (error) { console.error(error); }
        },
        (error) => {
          console.error("❌ GPS Error:", error.message);
          setLoadingLocation(false);
          setDeliveryAddress("123, AquaMart Street, Mumbai - 400001");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLoadingLocation(false);
      setDeliveryAddress("123, AquaMart Street, Mumbai - 400001");
    }
  }, []);

  const handleAddressChange = async (e) => {
    const newAddress = e.target.value;
    setDeliveryAddress(newAddress);
    setIsTyping(true);
    if (newAddress.length > 3) {
      try {
        const result = await axios.get(
          `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(newAddress)}&format=json&apiKey=${apiKey}`
        );
        if (result.data.results && result.data.results.length > 0) {
          const firstResult = result.data.results[0];
          const newLat = firstResult.lat;
          const newLng = firstResult.lon;
          if (newLat && newLng) {
            setPosition({ lat: newLat, lng: newLng });
          }
        }
      } catch (error) { console.error("Search Error:", error); }
    }
    setIsTyping(false);
  };

  // 🔥 BACKEND API CALL (Place Order)
  // 🔥 BACKEND API CALL (Place Order) - PRODUCTION READY
  const handlePlaceOrder = async () => {
    // 1. Empty Cart Check
    if (cartitems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    // 2. Empty Address Check
    if (!deliveryAddress.trim()) {
      alert("Please enter a valid delivery address.");
      return;
    }

    // 3. Token Check (Prevent 401 Unauthorized)
    const token = localStorage.getItem('token');
    if (!token) {
      alert("You are not logged in. Please login to place an order.");
      return;
    }

    setIsPlacingOrder(true); // Start loading

    try {
      // 4. Prepare payload (with safe quantity)
      const safeCartItems = cartitems.map(item => ({
        ...item,
        quantity: item.quantity || 1000 // Default 1kg if missing
      }));

      const orderData = {
        cartItems: safeCartItems,
        paymentMethod: paymentMethod,
        deliveryAddress: {
          text: deliveryAddress,
          latitude: position.lat,
          longitude: position.lng
        }
      };

      // 5. Make API Call
      const response = await axios.post(
        `${serverUrl}/api/order/place-order`,
        orderData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true
        }
      );

      // 6. Success - SMOOTH NAVIGATION (NO ALERT!)
      if (response.data.success) {
        dispatch(clearCart()); 
        
        navigate('/order-placed', { 
          state: { 
            orderData: response.data.order 
          } 
        });
      }

    } catch (error) {
      console.error("❌ Error placing order:", error);
      
      // 7. Smart Error Handling (Network + Backend errors)
      let errorMessage = "Failed to place order. Please try again.";
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = "Unable to connect to the server. Please check your internet connection.";
      } else if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      }
      
      // Only show alert on ERROR
      alert(errorMessage);
      
    } finally {
      setIsPlacingOrder(false); // Stop loading
    }
  };

  return (
    <div className="min-h-screen bg-white flex justify-center py-8 px-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.05)] p-6 sm:p-8 border border-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/cart')}
              className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <FaArrowLeft className="text-slate-600 w-4 h-4" />
            </button>
            <h1 className="text-xl font-bold text-slate-900">Checkout</h1>
          </div>
        </div>

        {cartitems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
            <FaBox className="w-16 h-16 text-cyan-400 mx-auto mb-4 opacity-60" />
            <h2 className="text-xl font-bold text-slate-700">Your Cart is Empty!</h2>
            <button 
              onClick={() => navigate('/home')}
              className="mt-4 px-8 py-2.5 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* 🔥 Delivery Location Section */}
            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <FaMapMarkerAlt className="text-red-500 w-4 h-4" /> Delivery Location
              </h2>
              
              <div className="relative mb-3">
                <textarea
                  value={deliveryAddress}
                  onChange={handleAddressChange}
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 resize-none"
                  rows={2}
                  placeholder="Enter your delivery address..."
                />
                {isTyping && <div className="absolute bottom-3 right-3 text-xs text-orange-500 animate-pulse">Searching...</div>}
              </div>

              <div className="h-52 w-full rounded-lg overflow-hidden border border-slate-200 shadow-inner z-0">
                <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker position={position} setPosition={setPosition} setDeliveryAddress={setDeliveryAddress} />
                  <ChangeMapView coords={position} />
                </MapContainer>
              </div>
            </div>

            {/* 🔥 Payment Method Section */}
            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-3">Payment Method</h2>
              
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                  <FaMoneyBillWave className={`text-lg ${paymentMethod === 'cod' ? 'text-orange-500' : 'text-slate-400'}`} />
                  <span className={`text-sm font-medium ${paymentMethod === 'cod' ? 'text-orange-600' : 'text-slate-700'}`}>Cash On Delivery</span>
                </label>

                <label className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                  <FaCreditCard className={`text-lg ${paymentMethod === 'card' ? 'text-orange-500' : 'text-slate-400'}`} />
                  <span className={`text-sm font-medium ${paymentMethod === 'card' ? 'text-orange-600' : 'text-slate-700'}`}>UPI / Card</span>
                </label>
              </div>
            </div>

            {/* 🔥 Order Summary Section */}
            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-3">Order Summary</h2>
              
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                {cartitems.map((item) => {
                  const weight = item.quantity || 1000;
                  const displayWeight = weight >= 1000 ? `${(weight/1000).toFixed(1)} kg` : `${weight} g`;
                  const itemPrice = (item.price / 1000) * weight;
                  return (
                    <div key={item._id || item.id} className="flex justify-between text-sm text-slate-700 py-1.5 border-b border-slate-200/50 last:border-0">
                      <span>{item.name} x {displayWeight}</span>
                      <span className="font-medium text-slate-900">₹{itemPrice.toFixed(0)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">₹{totalPrice.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Packaging</span>
                  <span className="font-medium text-slate-900">₹20</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between text-base font-bold text-slate-900">
                <span>Total</span>
                <span className="text-orange-600">₹{(totalPrice + 20).toFixed(0)}</span>
              </div>
              
              {/* 🔥 LOADING STATE BUTTON */}
              <button 
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className={`w-full mt-5 py-3 text-white font-bold rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2
                  ${isPlacingOrder ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 hover:shadow-lg active:scale-95'}
                `}
              >
                {isPlacingOrder ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Placing Order...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;