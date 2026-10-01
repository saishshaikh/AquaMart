import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Truck, Package, CheckCircle, Navigation, Phone, MapPin, 
  Key, AlertCircle, DollarSign, Award, Clock, ShieldCheck, ToggleLeft, ToggleRight
} from 'lucide-react';
import DeliveryMap from '../components/DeliveryMap';
import LocationSender from '../components/LocationSender';
import { serverUrl } from '../App';

function DeliveryDashboard() {
  const [orders, setOrders] = useState([]);
  const [myOrder, setMyOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [completing, setCompleting] = useState(false);
  const navigate = useNavigate();

  const userData = useSelector((state) => state.user?.userData);
  const isFetchingRef = useRef(false);

  const getAxiosConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    };
  };

  const fetchOrders = async () => {
    const currentRole = userData?.role?.trim()?.toLowerCase();
    if (currentRole !== 'delivery' && currentRole !== 'delivery_boy') return;
    
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      const config = getAxiosConfig();

      // Check Active Order
      try {
        const activeRes = await axios.get(`${serverUrl}/api/delivery/active-order`, config);
        if (activeRes.data?.success && activeRes.data?.order) {
          setMyOrder(activeRes.data.order);
          setLoading(false);
          isFetchingRef.current = false;
          return;
        } else {
          setMyOrder(null);
        }
      } catch (err) {
        // Continue to available orders
      }

      // Fetch Available Orders
      const res = await axios.get(`${serverUrl}/api/delivery/available-orders`, config);
      if (res.data?.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error("❌ Delivery Fetch Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    const currentRole = userData?.role?.trim()?.toLowerCase();
    if (currentRole !== 'delivery' && currentRole !== 'delivery_boy') {
      setLoading(false);
      return;
    }

    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();
    }, 8000);

    return () => clearInterval(interval);
  }, [userData?.role]);

  const acceptOrder = async (orderId) => {
    try {
      const res = await axios.post(
        `${serverUrl}/api/delivery/accept`,
        { orderId },
        getAxiosConfig()
      );

      if (res.data?.success) {
        setMyOrder(res.data.order);
        setOrders([]);
        setOtpError('');
        setOtpInput('');
      }
    } catch (err) {
      alert(err.response?.data?.message || '❌ Could not accept order');
    }
  };

  const markDeliveredWithOtp = async (e) => {
    e.preventDefault();
    if (!otpInput || otpInput.length < 4) {
      setOtpError('Please enter the 4-digit OTP provided by the customer.');
      return;
    }

    setCompleting(true);
    setOtpError('');

    try {
      const res = await axios.put(
        `${serverUrl}/api/delivery/complete/${myOrder._id}`,
        { otp: otpInput },
        getAxiosConfig()
      );

      if (res.data?.success) {
        alert('🎉 Order Delivered & OTP Verified Successfully!');
        setMyOrder(null);
        setOtpInput('');
        fetchOrders();
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || '❌ Invalid OTP! Please check with customer.');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070d18] text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-cyan-400 font-medium text-sm">Connecting to Fleet Dispatch...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed -right-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-32 -left-32 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        
        {/* TOP STATUS BAR */}
        <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl p-4 sm:p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-cyan-500/30">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white">{userData?.fullName || "Delivery Partner"}</h1>
                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck size={10} /> Active Rider
                </span>
              </div>
              <p className="text-xs text-slate-400">AquaMart Fleet Services • {userData?.city || "Mumbai"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 self-end sm:self-auto">
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-bold transition-all ${
                isOnline 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-lg shadow-emerald-500/10' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {isOnline ? <ToggleRight className="text-emerald-400" /> : <ToggleLeft />}
              <span>{isOnline ? 'Online (Ready)' : 'Offline'}</span>
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold block">Today's Earnings</span>
            <span className="text-xl font-black text-cyan-400 font-mono">₹{userData?.totalDeliveries ? userData.totalDeliveries * 60 : 420}</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold block">Deliveries Done</span>
            <span className="text-xl font-black text-emerald-400 font-mono">{userData?.totalDeliveries || 7} Drops</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold block">Customer Rating</span>
            <span className="text-xl font-black text-amber-400 font-mono">★ 4.95</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold block">Live GPS Status</span>
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1">
              <Navigation size={12} className="animate-pulse text-cyan-400" /> Transmitting
            </span>
          </div>
        </div>

        {/* ACTIVE DELIVERY CARD (IF ASSIGNED) */}
        {myOrder ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <h2 className="text-lg font-black text-emerald-400 uppercase tracking-wider">
                Ongoing Delivery Mission
              </h2>
            </div>

            {/* Live GPS location background sender */}
            <LocationSender activeOrderId={myOrder._id} />

            <div className="bg-slate-900/80 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl space-y-6">
              
              {/* Top details */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-800 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 font-mono">ORDER ID:</span>
                    <span className="text-sm font-black text-cyan-400 font-mono">#{myOrder._id?.slice(-8).toUpperCase()}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Customer: <span className="text-white font-bold">{myOrder.user?.fullName || myOrder.userName || "Customer"}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${myOrder.user?.mobile || myOrder.userMobile || '9999999999'}`}
                    className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Phone size={14} /> Call Customer
                  </a>
                </div>
              </div>

              {/* Pickup & Drop Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                    <Store size={12} /> 1. Pickup Seafood Point:
                  </span>
                  <p className="text-xs text-slate-200 font-medium">
                    {myOrder.shopOrders?.[0]?.shop?.name || myOrder.shopOrders?.[0]?.shopName || 'AquaMart Coastal Hub'}
                  </p>
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    {myOrder.shopOrders?.[0]?.shop?.address || 'Dock #4, Sea Port Road'}
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <MapPin size={12} /> 2. Customer Delivery Address:
                  </span>
                  <p className="text-xs text-slate-200 font-medium line-clamp-2">
                    {myOrder.deliveryAddress?.text || 'Doorstep Address'}
                  </p>
                </div>
              </div>

              {/* Live Route Map */}
              <div className="rounded-2xl overflow-hidden border border-slate-800">
                <DeliveryMap
                  userLat={myOrder.deliveryAddress?.location?.lat || myOrder.deliveryAddress?.latitude || 19.2812}
                  userLng={myOrder.deliveryAddress?.location?.lng || myOrder.deliveryAddress?.longitude || 73.0482}
                  userAddress={myOrder.deliveryAddress?.text || 'Customer Location'}
                />
              </div>

              {/* 🔐 OTP VERIFICATION & COMPLETE DELIVERY */}
              <form onSubmit={markDeliveredWithOtp} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Verify 4-Digit Customer OTP</h3>
                    <p className="text-[11px] text-slate-400">Ask the customer for the verification OTP displayed on their order screen</p>
                  </div>
                </div>

                {otpError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle size={14} /> {otpError}
                  </div>
                )}

                <div className="flex gap-3">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="Enter 4-Digit OTP"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-center font-mono font-bold text-cyan-300 tracking-widest outline-none focus:border-cyan-400"
                    required
                  />

                  <button
                    type="submit"
                    disabled={completing}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-2 shrink-0"
                  >
                    <CheckCircle size={16} />
                    {completing ? 'Verifying...' : 'Complete Delivery'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        ) : (
          /* AVAILABLE ORDERS LIST */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-cyan-400" />
                Available Deliveries in Your Queue
              </h2>
              <span className="text-xs bg-slate-900 px-3 py-1 rounded-full text-cyan-400 border border-slate-800 font-bold">
                {orders.length} Ready to Pickup
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                <Clock className="w-12 h-12 text-cyan-400/60 mx-auto animate-pulse" />
                <h3 className="text-base font-bold text-white">No active deliveries at the moment</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  New orders from nearby seafood shops will appear here in real-time. Keep your status Online!
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <div 
                    key={order._id}
                    className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl transition-all"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-slate-950 px-2 py-0.5 rounded-lg text-slate-400 font-mono">
                          #{order._id?.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-emerald-400 font-black text-lg font-mono">₹{order.totalAmount}</span>
                        <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/20 font-bold">
                          Commission: ₹60
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 flex items-center gap-1.5">
                        <MapPin size={12} className="text-cyan-400 shrink-0" />
                        <span className="line-clamp-1">{order.deliveryAddress?.text || "Customer Address"}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => acceptOrder(order._id)}
                      className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                    >
                      Accept Drop (+₹60)
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default DeliveryDashboard;