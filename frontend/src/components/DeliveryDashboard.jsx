import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DeliveryMap from '../components/DeliveryMap'; // 📍 Live Geoapify Map Component

const SERVER_URL = "http://localhost:8000";

function DeliveryDashboard() {
  const [orders, setOrders] = useState([]);
  const [myOrder, setMyOrder] = useState(null);
  const [loading, setLoading] = useState(true);
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
    // Delivery role safety check
    const currentRole = userData?.role?.trim()?.toLowerCase();
    if (currentRole !== 'delivery' && currentRole !== 'delivery_boy') return;
    
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/delivery/login');
        return;
      }

      const config = getAxiosConfig();

      // Check Active Order
      try {
        const activeRes = await axios.get(`${SERVER_URL}/api/delivery/active-order`, config);
        if (activeRes.data?.success && activeRes.data?.order) {
          setMyOrder(activeRes.data.order);
          setLoading(false);
          isFetchingRef.current = false;
          return;
        }
      } catch (err) {
        // Continue to available orders if active order fetch fails
      }

      // Fetch Available Orders
      const res = await axios.get(`${SERVER_URL}/api/delivery/available-orders`, config);
      if (res.data?.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error("❌ Fetch Error:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/delivery/login');
      }
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
    }, 10000);

    return () => clearInterval(interval);
  }, [userData?.role]);

  // Prevent UI flash for non-delivery users
  const currentRole = userData?.role?.trim()?.toLowerCase();
  if (userData && currentRole !== 'delivery' && currentRole !== 'delivery_boy') {
    return null;
  }

  const acceptOrder = async (orderId) => {
    try {
      const res = await axios.post(
        `${SERVER_URL}/api/delivery/accept`,
        { orderId },
        getAxiosConfig()
      );

      if (res.data?.success) {
        alert('✅ Order Accepted!');
        setMyOrder(res.data.order);
        setOrders([]);
      }
    } catch (err) {
      alert(err.response?.data?.message || '❌ Could not accept order');
    }
  };

  const markDelivered = async () => {
    try {
      const res = await axios.put(
        `${SERVER_URL}/api/delivery/complete/${myOrder._id}`,
        {},
        getAxiosConfig()
      );

      if (res.data?.success) {
        alert('✅ Order Delivered Successfully!');
        setMyOrder(null);
        fetchOrders();
      }
    } catch (err) {
      alert('❌ Failed to mark as delivered');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (myOrder) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 flex items-center justify-center">
        <div className="w-full max-w-lg">
          <h1 className="text-2xl font-bold text-emerald-400 mb-4 text-center">🚚 Active Delivery</h1>
          <div className="bg-slate-800 p-6 rounded-3xl border border-emerald-500/30 shadow-2xl">
            
            {/* Header Details */}
            <div className="space-y-3 border-b border-slate-700 pb-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Order ID</span>
                <span className="font-mono font-bold text-cyan-400">#{myOrder._id?.slice(-6).toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Customer</span>
                <span className="font-semibold text-white">{myOrder.user?.fullName || myOrder.userName || 'Customer'}</span>
              </div>
            </div>

            {/* Address Details */}
            <div className="space-y-3 mb-4">
              <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-700">
                <p className="text-xs text-slate-400 mb-1">📍 Pickup Location</p>
                <p className="text-sm font-medium">{myOrder.shopOrders?.[0]?.shop?.address || 'Shop Address'}</p>
              </div>
              <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-700">
                <p className="text-xs text-slate-400 mb-1">📍 Drop Location</p>
                <p className="text-sm font-medium">{myOrder.deliveryAddress?.text || myOrder.deliveryAddress?.address || 'Kālu River, Thane, India'}</p>
              </div>
            </div>

            {/* 🗺️ LIVE GEOAPIFY NAVIGATION MAP */}
            <DeliveryMap
              userLat={myOrder.deliveryAddress?.location?.lat || myOrder.deliveryAddress?.lat}
              userLng={myOrder.deliveryAddress?.location?.lng || myOrder.deliveryAddress?.lng}
              userAddress={myOrder.deliveryAddress?.text || myOrder.deliveryAddress?.address || 'Customer Location'}
            />

            {/* Complete Delivery Action */}
            <div className="flex flex-col gap-3 mt-4">
              <button 
                onClick={markDelivered}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg transition-all"
              >
                ✅ Mark as Delivered
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-cyan-400 mb-6 text-center flex items-center justify-center gap-2">
          🛵 Available Orders
          <span className="text-xs font-normal bg-slate-800 px-3 py-1 rounded-full text-slate-300 border border-slate-700">
            {orders.length} live
          </span>
        </h1>
        
        {orders.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-slate-800 border-dashed">
            <div className="text-slate-500 text-6xl mb-4">📦</div>
            <p className="text-slate-400 font-medium">No orders available right now.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map(order => (
              <div key={order._id} className="bg-slate-800 p-5 rounded-3xl border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-slate-900 px-2 py-1 rounded-lg text-slate-400 font-mono">#{order._id?.slice(-6).toUpperCase()}</span>
                    <span className="text-emerald-400 font-bold text-xl">₹{order.totalAmount}</span>
                  </div>
                  <p className="text-sm text-slate-300 line-clamp-1">{order.deliveryAddress?.text || order.deliveryAddress?.address || 'Address not available'}</p>
                </div>

                <button 
                  onClick={() => acceptOrder(order._id)}
                  className="w-full sm:w-auto px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all font-semibold"
                >
                  Accept Delivery
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DeliveryDashboard;