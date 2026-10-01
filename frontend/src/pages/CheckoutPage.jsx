import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaCreditCard, 
  FaBox, 
  FaMapMarkerAlt, 
  FaMoneyBillWave, 
  FaQrcode, 
  FaShieldAlt, 
  FaCheckCircle, 
  FaPercent, 
  FaMobileAlt, 
  FaLock,
  FaReceipt
} from 'react-icons/fa';
import { clearCart } from '../redux/userSlice';
import axios from 'axios';
import { serverUrl } from '../App';

// Map Components
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const apiKey = import.meta.env.VITE_GEOAPIKEY;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function LocationMarker({ position, setPosition, setDeliveryAddress }) {
  const map = useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);

      let fullAddress = '';
      if (apiKey && apiKey.trim() !== '') {
        try {
          const result = await axios.get(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apiKey}`
          );
          const location = result.data?.results?.[0];
          if (location) {
            fullAddress = (location.address_line1 || "") + (location.address_line2 ? ", " + location.address_line2 : "");
          }
        } catch (error) {
          console.error("Geoapify reverse geocode error:", error);
        }
      }

      if (!fullAddress) {
        try {
          const osmResult = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
          );
          if (osmResult.data?.display_name) {
            fullAddress = osmResult.data.display_name;
          }
        } catch (osmError) {
          console.error("OSM reverse geocode error:", osmError);
        }
      }

      if (fullAddress) setDeliveryAddress(fullAddress);
      map.flyTo(e.latlng, map.getZoom());
    },
  });
  return position === null ? null : (
    <Marker position={position}>
      <Popup>
        <div className="text-slate-900 font-semibold text-xs">📍 Delivery Location</div>
      </Popup>
    </Marker>
  );
}

function ChangeMapView({ coords }) {
  const map = useMap();
  useEffect(() => { if (coords) map.flyTo(coords, map.getZoom()); }, [coords, map]);
  return null;
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartitems, userData } = useSelector((state) => state.user);

  const [position, setPosition] = useState({ lat: 19.0760, lng: 72.8777 });
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod', 'upi', 'card'
  
  // Real E-Commerce Coupon System
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');

  // Payment Modal Simulation
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState('processing'); // 'processing', 'success'
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Precise Subtotal Calculation based on selected weights
  const subtotal = cartitems.reduce((acc, item) => {
    const weightInGrams = item.quantity || 1000;
    const pricePerGram = item.price / 1000;
    return acc + (pricePerGram * weightInGrams);
  }, 0);

  const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 40;
  const packagingFee = subtotal > 0 ? 20 : 0;
  const gstTax = Math.round(subtotal * 0.05); // 5% GST
  const grandTotal = Math.max(0, Math.round(subtotal + deliveryFee + packagingFee + gstTax - appliedDiscount));

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition({ lat: latitude, lng: longitude });
          setLoadingLocation(false);

          let fullAddress = '';
          if (apiKey && apiKey.trim() !== '') {
            try {
              const result = await axios.get(
                `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
              );
              const location = result.data?.results?.[0];
              if (location) {
                fullAddress = (location.address_line1 || "") + (location.address_line2 ? ", " + location.address_line2 : "");
              }
            } catch (error) { console.error("Geoapify error:", error); }
          }

          if (!fullAddress) {
            try {
              const osmResult = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
              );
              if (osmResult.data?.display_name) {
                fullAddress = osmResult.data.display_name;
              }
            } catch (osmError) {
              console.error("OSM error:", osmError);
            }
          }

          if (fullAddress) setDeliveryAddress(fullAddress);
        },
        (error) => {
          console.error("❌ GPS Error:", error.message);
          setLoadingLocation(false);
          setDeliveryAddress("123, AquaMarine Bay Road, Mumbai - 400001");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLoadingLocation(false);
      setDeliveryAddress("123, AquaMarine Bay Road, Mumbai - 400001");
    }
  }, []);

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${serverUrl}/api/coupon/apply`,
        { code, cartTotal: subtotal },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (res.data?.success) {
        setAppliedDiscount(res.data.coupon?.discount || 50);
        setCouponMessage(res.data.message || `🎉 Coupon ${code} applied successfully!`);
        return;
      }
    } catch (err) {
      // Graceful local fallback for standard promo codes
      if (code === 'AQUA50' && subtotal >= 300) {
        setAppliedDiscount(50);
        setCouponMessage('🎉 Coupon AQUA50 applied! ₹50 Discount');
      } else if (code === 'FRESH10') {
        const discount = Math.round(subtotal * 0.1);
        setAppliedDiscount(discount);
        setCouponMessage(`🎉 Coupon FRESH10 applied! 10% Discount (₹${discount})`);
      } else {
        setAppliedDiscount(0);
        setCouponMessage(err.response?.data?.message || '❌ Invalid coupon code or minimum cart value not met.');
      }
    }
  };

  const handleAddressChange = async (e) => {
    const newAddress = e.target.value;
    setDeliveryAddress(newAddress);
    setIsTyping(true);
    if (newAddress.length > 3) {
      try {
        if (apiKey && apiKey.trim() !== '') {
          const result = await axios.get(
            `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(newAddress)}&format=json&apiKey=${apiKey}`
          );
          if (result.data.results && result.data.results.length > 0) {
            const firstResult = result.data.results[0];
            if (firstResult.lat && firstResult.lon) {
              setPosition({ lat: firstResult.lat, lng: firstResult.lon });
            }
          }
        } else {
          const osmRes = await axios.get(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(newAddress)}&limit=1`
          );
          if (osmRes.data && osmRes.data.length > 0) {
            const item = osmRes.data[0];
            setPosition({ lat: parseFloat(item.lat), lng: parseFloat(item.lon) });
          }
        }
      } catch (error) { console.error("Search Error:", error); }
    }
    setIsTyping(false);
  };

  const executeOrderCreation = async (txnId = null) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please log in to complete checkout.");
      navigate('/signin');
      return;
    }

    try {
      const formattedCartItems = cartitems.map(item => {
        const weightInGrams = item.quantity || 1000;
        const itemCalculatedPrice = (item.price / 1000) * weightInGrams;
        const shopId = typeof item.shop === 'object' ? item.shop?._id : (item.shop || item.shopId || item.owner);

        return {
          _id: item._id || item.id,
          name: item.name,
          price: Math.round(itemCalculatedPrice),
          quantity: 1,
          weightInGrams: weightInGrams,
          shop: shopId,
          image: item.image
        };
      });

      const orderData = {
        cartItems: formattedCartItems,
        paymentMethod: paymentMethod === 'upi' ? 'upi' : (paymentMethod === 'card' ? 'card' : 'cod'),
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        transactionId: txnId || `AQM_${Date.now()}`,
        discount: appliedDiscount,
        deliveryAddress: {
          text: deliveryAddress,
          latitude: position.lat,
          longitude: position.lng
        }
      };

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

      if (response.data.success) {
        dispatch(clearCart());
        navigate('/order-placed', { 
          state: { 
            orderData: response.data.order || orderData 
          } 
        });
      }
    } catch (error) {
      console.error("❌ Error placing order:", error);
      const msg = error.response?.data?.message || "Failed to place order. Please try again.";
      alert(msg);
      setShowPaymentModal(false);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handlePlaceOrder = () => {
    if (cartitems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    if (!deliveryAddress.trim()) {
      alert("Please enter a valid delivery address.");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please log in to place an order.");
      navigate('/signin');
      return;
    }

    if (paymentMethod === 'cod') {
      setIsPlacingOrder(true);
      executeOrderCreation();
    } else {
      setShowPaymentModal(true);
      setPaymentStep('processing');
    }
  };

  const handleSimulateOnlinePayment = () => {
    setIsPlacingOrder(true);
    setPaymentStep('verifying');
    
    setTimeout(() => {
      setPaymentStep('success');
      setTimeout(() => {
        executeOrderCreation(`PAY_${Math.floor(100000000 + Math.random() * 900000000)}`);
      }, 1200);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/3 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/40 hover:bg-slate-800/80 transition-all duration-200"
          >
            <FaArrowLeft className="w-3.5 h-3.5" />
            <span className="text-sm font-medium">Back to Cart</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FaShieldAlt className="w-3 h-3" /> 256-Bit SSL Secured
            </span>
          </div>
        </div>

        {cartitems.length === 0 ? (
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-2xl">
            <FaBox className="w-16 h-16 text-cyan-400/60 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Your Cart is Empty</h2>
            <p className="text-slate-400 text-sm mb-6">Add fresh seafood from our local catch catalog to proceed.</p>
            <button 
              onClick={() => navigate('/home')}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all duration-200"
            >
              Browse Fresh Catch
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: Delivery Details & Payment Method (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* 1. Delivery Address & Interactive Map */}
              <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">1</span>
                    <FaMapMarkerAlt className="text-cyan-400 w-4 h-4" /> Delivery Address
                  </h2>
                  <span className="text-xs text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2.5 py-1 rounded-full">
                    GPS Auto-Locate Active
                  </span>
                </div>

                <div className="relative mb-4">
                  <textarea
                    value={deliveryAddress}
                    onChange={handleAddressChange}
                    className="w-full p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 transition-all placeholder:text-slate-500 resize-none"
                    rows={2}
                    placeholder="Enter complete building name, street, landmark, city..."
                  />
                  {isTyping && (
                    <div className="absolute bottom-3 right-3 text-xs text-cyan-400 animate-pulse font-medium">
                      Searching coordinates...
                    </div>
                  )}
                </div>

                {/* Leaflet Map Preview */}
                <div className="h-56 w-full rounded-xl overflow-hidden border border-slate-800 relative shadow-inner">
                  <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={position} setPosition={setPosition} setDeliveryAddress={setDeliveryAddress} />
                    <ChangeMapView coords={position} />
                  </MapContainer>
                  <div className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-lg text-[11px] text-slate-300 border border-slate-700 pointer-events-none z-[1000]">
                    💡 Click anywhere on map to pin accurate doorstep
                  </div>
                </div>
              </div>

              {/* 2. Payment Method Selection */}
              <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl">
                <h2 className="text-base font-bold text-white flex items-center gap-2.5 mb-4">
                  <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">2</span>
                  Payment Option
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* COD Option */}
                  <label 
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border cursor-pointer transition-all duration-200 text-center gap-2 relative ${
                      paymentMethod === 'cod' 
                        ? 'bg-cyan-950/40 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <input type="radio" name="payMethod" checked={paymentMethod === 'cod'} onChange={() => {}} className="hidden" />
                    <FaMoneyBillWave className="text-2xl mb-1 text-emerald-400" />
                    <span className="text-xs font-bold">Cash On Delivery</span>
                    <span className="text-[10px] text-slate-400">Pay at doorstep</span>
                  </label>

                  {/* UPI Option */}
                  <label 
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border cursor-pointer transition-all duration-200 text-center gap-2 relative ${
                      paymentMethod === 'upi' 
                        ? 'bg-cyan-950/40 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <input type="radio" name="payMethod" checked={paymentMethod === 'upi'} onChange={() => {}} className="hidden" />
                    <FaQrcode className="text-2xl mb-1 text-cyan-400" />
                    <span className="text-xs font-bold">Instant UPI / QR</span>
                    <span className="text-[10px] text-slate-400">GPay, PhonePe, Paytm</span>
                  </label>

                  {/* Card Option */}
                  <label 
                    onClick={() => setPaymentMethod('card')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border cursor-pointer transition-all duration-200 text-center gap-2 relative ${
                      paymentMethod === 'card' 
                        ? 'bg-cyan-950/40 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <input type="radio" name="payMethod" checked={paymentMethod === 'card'} onChange={() => {}} className="hidden" />
                    <FaCreditCard className="text-2xl mb-1 text-blue-400" />
                    <span className="text-xs font-bold">Card / NetBanking</span>
                    <span className="text-[10px] text-slate-400">Visa, Master, RuPay</span>
                  </label>

                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Order Breakdown, Promo & Final Action (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl">
                
                <h2 className="text-base font-bold text-white mb-4 flex items-center justify-between">
                  <span>Cart Items Breakdown</span>
                  <span className="text-xs font-normal text-slate-400">{cartitems.length} items</span>
                </h2>

                {/* Items preview list */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1 mb-6 custom-scrollbar">
                  {cartitems.map((item) => {
                    const weight = item.quantity || 1000;
                    const displayWeight = weight >= 1000 ? `${(weight/1000).toFixed(1)} kg` : `${weight} g`;
                    const itemPrice = Math.round((item.price / 1000) * weight);

                    return (
                      <div key={item._id || item.id} className="flex items-center justify-between text-xs py-2 border-b border-slate-800/60 last:border-0">
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.image || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100"} 
                            alt={item.name} 
                            className="w-10 h-10 rounded-lg object-cover border border-slate-800"
                          />
                          <div>
                            <p className="font-semibold text-slate-200 line-clamp-1">{item.name}</p>
                            <p className="text-cyan-400 text-[11px] font-medium">{displayWeight}</p>
                          </div>
                        </div>
                        <span className="font-bold text-slate-100">₹{itemPrice}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Coupon Code Section */}
                <div className="mb-6 pt-2 border-t border-slate-800/80">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <FaPercent className="absolute left-3.5 top-3.5 text-slate-500 w-3 h-3" />
                      <input 
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Coupon (e.g. AQUA50, FRESH10)"
                        className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <button 
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 font-semibold rounded-xl text-xs transition-all"
                    >
                      Apply
                    </button>
                  </div>
                  {couponMessage && (
                    <p className={`text-[11px] mt-1.5 font-medium ${appliedDiscount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {couponMessage}
                    </p>
                  )}
                </div>

                {/* Bill Summary */}
                <div className="space-y-2.5 text-xs text-slate-300 pt-3 border-t border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Item Subtotal</span>
                    <span className="font-semibold text-slate-200">₹{Math.round(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Delivery Charges</span>
                    <span className={deliveryFee === 0 ? "text-emerald-400 font-semibold" : "font-semibold text-slate-200"}>
                      {deliveryFee === 0 ? "FREE (Above ₹499)" : `₹${deliveryFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Temperature Packaging</span>
                    <span className="font-semibold text-slate-200">₹{packagingFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">GST (5% FSSAI SeaFood Tax)</span>
                    <span className="font-semibold text-slate-200">₹{gstTax}</span>
                  </div>
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>Promotional Discount</span>
                      <span>-₹{appliedDiscount}</span>
                    </div>
                  )}

                  <div className="pt-3 mt-2 border-t border-slate-700 flex justify-between items-center text-sm font-bold text-white">
                    <span>Total Amount Payable</span>
                    <span className="text-lg text-cyan-400">₹{grandTotal}</span>
                  </div>
                </div>

                {/* Main Action Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className={`w-full mt-6 py-3.5 rounded-xl font-bold text-sm text-white shadow-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                    isPlacingOrder 
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-cyan-500/20 active:scale-98'
                  }`}
                >
                  {isPlacingOrder ? (
                    <>
                      <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    paymentMethod === 'cod' ? `Place Order (Cash On Delivery • ₹${grandTotal})` : `Proceed to Pay ₹${grandTotal}`
                  )}
                </button>

                <p className="text-center text-[11px] text-slate-400 mt-3 flex items-center justify-center gap-1.5">
                  <FaLock className="text-cyan-400 w-2.5 h-2.5" /> 100% Secure Checkout Guarantee
                </p>

              </div>

            </div>

          </div>
        )}

      </div>

      {/* ==================================================== */}
      {/* REAL ONLINE PAYMENT MODAL (UPI / CARD SIMULATOR) */}
      {/* ==================================================== */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-300">
            
            {paymentStep === 'processing' && (
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
                      ₹
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">AquaMart Secure Gateway</h3>
                      <p className="text-[11px] text-slate-400">Total: ₹{grandTotal}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowPaymentModal(false)}
                    className="text-slate-400 hover:text-white text-sm p-1"
                  >
                    ✕
                  </button>
                </div>

                {paymentMethod === 'upi' ? (
                  <div className="space-y-4 text-center">
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 inline-block mx-auto shadow-inner">
                      {/* Interactive Simulated QR Code */}
                      <div className="w-44 h-44 bg-white p-2 rounded-xl flex items-center justify-center shadow-lg relative group">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=aquamart@bank&pn=AquaMart&am=${grandTotal}&cu=INR`} 
                          alt="UPI QR"
                          className="w-full h-full object-contain" 
                        />
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-300 font-medium">
                      Scan with any UPI app (GPay / PhonePe / Paytm)
                    </p>

                    <div className="pt-2">
                      <input 
                        type="text"
                        placeholder="Or enter your UPI ID (e.g. yourname@okaxis)"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 mb-3"
                      />
                      <button
                        onClick={handleSimulateOnlinePayment}
                        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        <FaCheckCircle /> Pay ₹{grandTotal} Now
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Card Number</label>
                      <input 
                        type="text"
                        placeholder="4532 •••• •••• 8920"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">Expiry Date</label>
                        <input 
                          type="text"
                          placeholder="MM/YY"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">CVV</label>
                        <input 
                          type="password"
                          placeholder="•••"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleSimulateOnlinePayment}
                      className="w-full mt-2 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <FaLock /> Authorize & Pay ₹{grandTotal}
                    </button>
                  </div>
                )}
              </div>
            )}

            {paymentStep === 'verifying' && (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <h3 className="font-bold text-white text-base">Verifying with Bank Gateway...</h3>
                <p className="text-xs text-slate-400">Please do not refresh or close this window.</p>
              </div>
            )}

            {paymentStep === 'success' && (
              <div className="text-center py-8 space-y-4 animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                  <FaCheckCircle className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-white text-lg">Payment Successful!</h3>
                <p className="text-xs text-emerald-400 font-semibold">₹{grandTotal} Authenticated • Generating Invoice...</p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default CheckoutPage;