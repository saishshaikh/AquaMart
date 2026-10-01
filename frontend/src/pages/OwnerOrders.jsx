import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { 
  ShoppingBag, Clock, CheckCircle, Package, Truck, 
  AlertCircle, Phone, User, ArrowLeft, RefreshCw 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';

function ShopOrders() {

  const navigate = useNavigate();
  const [shopOrders, setShopOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState({});

  // Status Badge Styling Configuration
  const statusConfig = {
    pending: { label: "Pending", color: "bg-amber-500/20 text-amber-300 border-amber-500/30", icon: <Clock size={13} /> },
    confirmed: { label: "Confirmed", color: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: <CheckCircle size={13} /> },
    processing: { label: "Processing", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30", icon: <Package size={13} /> },
    out_for_delivery: { label: "Out for Delivery", color: "bg-orange-500/20 text-orange-300 border-orange-500/30", icon: <Truck size={13} /> },
    delivered: { label: "Delivered", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", icon: <CheckCircle size={13} /> },
    cancelled: { label: "Cancelled", color: "bg-rose-500/20 text-rose-300 border-rose-500/30", icon: <AlertCircle size={13} /> },
  };

  // Fetch Orders API Call
  const fetchShopOrders = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${serverUrl}/api/order/shop-orders`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true
      });
      if (response.data.success) {
        setShopOrders(response.data.orders || []);
      }
    } catch (err) {
      console.error("Failed to fetch shop orders", err);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  // Initial fetch and auto-refresh interval for live orders (every 10 seconds)
  useEffect(() => {
    fetchShopOrders(true);
    const interval = setInterval(() => {
      fetchShopOrders(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchShopOrders]);

  // Update Status API Handler
  const handleStatusChange = async (orderId, shopOrderId, newStatus) => {
    try {
      setUpdatingStatus((prev) => ({ ...prev, [shopOrderId]: true }));
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${serverUrl}/api/order/status/${orderId}/${shopOrderId}`, 
        { status: newStatus },
        { 
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true 
        }
      );
      if (response.data.success) {
        setShopOrders((prevOrders) =>
          prevOrders.map((order) => {
            if (order._id === orderId) {
              return {
                ...order,
                shopOrders: order.shopOrders.map((so) =>
                  so._id === shopOrderId ? { ...so, shopStatus: newStatus } : so
                ),
              };
            }
            return order;
          })
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [shopOrderId]: false }));
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] bg-slate-950 bg-gradient-to-br from-slate-950 via-cyan-950/40 to-blue-950/60 p-4 sm:p-8 text-slate-100">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-2xl border border-cyan-500/20 p-5 rounded-3xl shadow-xl">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded-2xl border border-white/10 text-cyan-400 transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <ShoppingBag className="text-cyan-400 w-6 h-6" /> Live Shop Orders
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Manage incoming orders and update live order delivery status</p>
            </div>
          </div>

          <button 
            onClick={() => fetchShopOrders(true)}
            className="flex items-center gap-2 text-xs font-semibold bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 px-4 py-2.5 rounded-2xl text-cyan-300 transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh Orders</span>
          </button>
        </div>

        {/* Orders Listing */}
        {loading ? (
          <div className="text-center py-16 text-cyan-400 font-medium animate-pulse">
            Fetching customer orders...
          </div>
        ) : shopOrders.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-white/5 rounded-3xl">
            <Package className="mx-auto w-12 h-12 text-slate-600 mb-2" />
            <p className="text-slate-400">No active customer orders found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {shopOrders.map((order) => (
              <div key={order._id} className="bg-slate-900/70 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-5 flex flex-col gap-4">
                
                {/* Header Information */}
                <div className="flex flex-wrap justify-between items-center border-b border-white/10 pb-3 gap-2">
                  <div>
                    <span className="text-xs text-slate-400">Order ID: </span>
                    <span className="text-sm font-bold text-cyan-400">#{order._id?.slice(-8).toUpperCase()}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-950/60 px-3 py-1.5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-200">
                      <User size={14} className="text-cyan-400" />
                      <span className="font-semibold">{order.user?.name || order.userName || order.deliveryAddress?.name || "Customer"}</span>
                    </div>
                    {(order.user?.phone || order.deliveryAddress?.phone) && (
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Phone size={12} className="text-emerald-400" />
                        <span>{order.user?.phone || order.deliveryAddress?.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Total</p>
                    <p className="text-lg font-black text-emerald-400">₹{order.totalAmount || order.totalPrice || 0}</p>
                  </div>
                </div>

                {/* Sub-Orders & Status Options */}
                {order.shopOrders?.map((shopOrder) => {
                  const items = shopOrder.shopOrderItems || shopOrder.items || [];
                  const currentStatus = shopOrder.shopStatus || shopOrder.status || "pending";

                  return (
                    <div key={shopOrder._id} className="bg-slate-950/50 rounded-2xl p-4 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      <div className="flex flex-col gap-2 flex-1">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Items:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {items.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 bg-slate-900/90 p-2 rounded-xl border border-white/5">
                              {(item.image || item.item?.image) && (
                                <img src={item.image || item.item?.image} alt={item.name || item.itemName} className="w-10 h-10 object-cover rounded-lg" />
                              )}
                              <div className="flex-1">
                                <h5 className="text-xs font-bold text-white leading-tight">{item.name || item.itemName || item.item?.name}</h5>
                                <p className="text-[11px] text-cyan-400 font-semibold mt-0.5">₹{item.price || item.item?.price} × {item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-white/5 shrink-0">
                        <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${statusConfig[currentStatus]?.color || 'bg-slate-800 text-slate-300'}`}>
                          {statusConfig[currentStatus]?.icon}
                          <span>{statusConfig[currentStatus]?.label || currentStatus}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={currentStatus}
                            disabled={updatingStatus[shopOrder._id]}
                            onChange={(e) => handleStatusChange(order._id, shopOrder._id, e.target.value)}
                            className="bg-slate-800 border border-slate-600 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
                          >
                            {Object.keys(statusConfig).map((key) => (
                              <option key={key} value={key} className="bg-slate-900 text-white">
                                {statusConfig[key].label}
                              </option>
                            ))}
                          </select>

                          {updatingStatus[shopOrder._id] && (
                            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default ShopOrders;