import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import { 
  FaArrowLeft, 
  FaBox, 
  FaClock, 
  FaShoppingBag,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaPhone,
  FaCalendarAlt,
  FaCreditCard,
  FaWallet,
  FaImage,
  FaSpinner,
  FaStore,
  FaTrash,
  FaHeadset,
  FaChevronDown,
  FaChevronUp,
  FaRoute,
  FaReceipt
} from 'react-icons/fa';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import LiveTrackingMap from '../components/LiveTrackingMap';
import Footer from '../components/Footer';

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [trackingModal, setTrackingModal] = useState(null); 
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    fetchOrders();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 4000);
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      const response = await axios.get(`${serverUrl}/api/order/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error.response?.data || error.message);
      showNotification('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return { bg: 'bg-slate-800 text-slate-400 border-slate-700', icon: <FaBox />, label: 'Pending' };
    const map = {
      'pending': { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: <FaClock />, label: 'Pending' },
      'confirmed': { bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: <FaCheckCircle />, label: 'Confirmed' },
      'processing': { bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30', icon: <FaSpinner className="animate-spin" />, label: 'Processing' },
      'shipped': { bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30', icon: <FaTruck />, label: 'Shipped' },
      'out_for_delivery': { bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30 animate-pulse', icon: <FaTruck />, label: 'Out for Delivery' },
      'delivered': { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: <FaCheckCircle />, label: 'Delivered' },
      'cancelled': { bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30', icon: <FaTimesCircle />, label: 'Cancelled' }
    };
    return map[status.toLowerCase()] || map.pending;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      setCancellingOrder(orderId);
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${serverUrl}/api/order/${orderId}/cancel`,
        { reason: 'Cancelled by user' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        showNotification('Order cancelled successfully', 'success');
        await fetchOrders();
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      showNotification(error.response?.data?.message || 'Failed to cancel order', 'error');
    } finally {
      setCancellingOrder(null);
    }
  };

  const getItemImage = (item) => {
    if (!item) return null;
    let rawImage = 
      item.image || 
      item.itemImage || 
      item.imageUrl || 
      (Array.isArray(item.images) && item.images[0]) ||
      item.item?.image || 
      item.item?.itemImage || 
      item.item?.imageUrl || 
      (Array.isArray(item.item?.images) && item.item?.images[0]);

    if (!rawImage || typeof rawImage !== 'string' || rawImage.trim() === '') return null;

    if (rawImage.startsWith('http://') || rawImage.startsWith('https://') || rawImage.startsWith('data:image')) {
      return rawImage;
    }

    let cleanPath = rawImage.replace(/\\/g, '/');
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.slice(1);
    }

    const baseUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
    return `${baseUrl}/${cleanPath}`;
  };

  const getShopName = (shopOrder, idx = 0) => {
    if (!shopOrder) return `Shop #${idx + 1}`;
    return (
      shopOrder.shop?.name || 
      shopOrder.shop?.shopName || 
      shopOrder.shopName || 
      shopOrder.shop?.title ||
      shopOrder.name ||
      `Shop #${idx + 1}`
    );
  };

  const getAllOrderItemsWithShop = (order) => {
    const allItems = [];
    order.shopOrders?.forEach((shopOrder, idx) => {
      const shopName = getShopName(shopOrder, idx);
      shopOrder.shopOrderItems?.forEach(item => {
        allItems.push({
          ...item,
          shopName
        });
      });
    });
    return allItems;
  };

  const getTrackingSteps = (status) => {
    const steps = [
      { id: 1, label: 'Order Placed', description: 'Your order has been confirmed', icon: <FaCheckCircle />, key: 'pending' },
      { id: 2, label: 'Processing', description: 'Shop is preparing your item', icon: <FaSpinner />, key: 'processing' },
      { id: 3, label: 'Shipped', description: 'Item handed to delivery partner', icon: <FaTruck />, key: 'shipped' },
      { id: 4, label: 'Out for Delivery', description: 'Delivery executive is on the way', icon: <FaRoute />, key: 'out_for_delivery' },
      { id: 5, label: 'Delivered', description: 'Order successfully delivered', icon: <FaCheckCircle />, key: 'delivered' }
    ];

    const currentIndex = steps.findIndex(s => s.key === status?.toLowerCase());
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      isCurrent: index === currentIndex
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070d18] flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium text-sm">Loading your seafood orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Background glow effects */}
      <div className="pointer-events-none fixed -right-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-32 -left-32 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {notification.show && (
          <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl backdrop-blur-md bg-slate-900/95 border ${notification.type === 'success' ? 'border-emerald-500/40 text-emerald-400' : 'border-rose-500/40 text-rose-400'} transform transition-all duration-300 flex items-center gap-3`}>
            {notification.type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />}
            <p className="text-sm font-medium text-slate-200">{notification.message}</p>
          </div>
        )}

        {/* Top Header */}
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => navigate('/home')} 
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors font-medium bg-slate-900/80 hover:bg-slate-800 px-4 py-2 rounded-xl shadow-lg border border-slate-800 text-sm"
          >
            <FaArrowLeft className="text-xs text-cyan-400" /> Back
          </button>
          
          <div className="flex items-center gap-3">
            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-cyan-400">
              <FaShoppingBag className="text-lg" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">My Orders</h1>
              <p className="text-xs text-slate-400">{orders.length} orders recorded</p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-12 text-center border border-slate-800 shadow-2xl max-w-lg mx-auto">
            <div className="w-20 h-20 bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
              <FaBox className="w-8 h-8 text-cyan-400/60" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">No orders yet!</h2>
            <p className="text-xs text-slate-400 mb-6">Looks like you haven't placed an order with us yet.</p>
            <button
              onClick={() => navigate('/home')}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusBadge = getStatusBadge(order.status);
              const isExpanded = expandedOrder === order._id;
              const allItems = getAllOrderItemsWithShop(order);

              return (
                <div 
                  key={order._id}
                  className="bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-xl overflow-hidden hover:border-slate-700 transition-all duration-200"
                >
                  {/* Order Top Bar */}
                  <div className="p-5 sm:p-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 font-bold">
                        <FaReceipt className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">ORDER ID:</span>
                          <span className="text-sm font-bold text-white font-mono">
                            #{order._id?.slice(-8).toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <FaCalendarAlt className="w-3 h-3 text-slate-500" /> {formatDate(order.createdAt || order.orderPlacedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.bg}`}>
                        {statusBadge.icon}
                        {statusBadge.label}
                      </span>

                      <button
                        onClick={() => setTrackingModal(order)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
                      >
                        <FaRoute /> Track Order
                      </button>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="p-5 sm:p-6">
                    <div className="space-y-3">
                      {allItems.slice(0, 2).map((item, idx) => {
                        const img = getItemImage(item);
                        return (
                          <div key={idx} className="flex items-center justify-between py-1">
                            <div className="flex items-center gap-3">
                              {img ? (
                                <img src={img} alt={item.name || item.itemName} className="w-12 h-12 rounded-xl object-cover border border-slate-800" />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400">
                                  <FaImage />
                                </div>
                              )}
                              <div>
                                <h4 className="text-sm font-bold text-white line-clamp-1">{item.name || item.itemName || "Seafood Item"}</h4>
                                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                                  <FaStore className="w-2.5 h-2.5 text-cyan-400" /> {item.shopName}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-extrabold text-cyan-400 font-mono">₹{item.price}</p>
                              <p className="text-[11px] text-slate-400 font-mono">x {item.quantity || 1}</p>
                            </div>
                          </div>
                        );
                      })}
                      {allItems.length > 2 && (
                        <p className="text-xs text-slate-400 italic">+{allItems.length - 2} more items in this order</p>
                      )}
                    </div>

                    {/* Delivery OTP Banner */}
                    {order.deliveryOtp && order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-2xl p-3 my-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-cyan-400 font-bold text-xs">🔐 Delivery OTP:</span>
                          <span className="text-[11px] text-slate-300">Share with delivery partner</span>
                        </div>
                        <span className="text-sm font-black font-mono text-cyan-300 tracking-widest bg-slate-900 px-3 py-1 rounded-xl border border-cyan-400 shadow-md">
                          {order.deliveryOtp}
                        </span>
                      </div>
                    )}

                    {/* Bottom Order Card Details */}
                    <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="text-xs text-slate-400">
                        Total Items: <span className="font-bold text-slate-200">{allItems.length}</span>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div>
                          <span className="text-xs text-slate-400">Grand Total: </span>
                          <span className="text-lg font-black text-cyan-400 font-mono">₹{order.totalAmount}</span>
                        </div>

                        <button
                          onClick={() => toggleOrderExpansion(order._id)}
                          className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                        >
                          {isExpanded ? 'Hide Details' : 'View Details'} {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Bill & Address Accordion */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4 text-xs animate-in fade-in duration-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                            <span className="font-bold text-slate-300 block mb-1">📍 Delivery Address:</span>
                            <p className="text-slate-400">{order.deliveryAddress?.text || "Doorstep Address"}</p>
                          </div>

                          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                            <span className="font-bold text-slate-300 block mb-1">💳 Payment Details:</span>
                            <p className="text-slate-400">Method: <span className="text-slate-200 font-semibold uppercase">{order.paymentMethod}</span></p>
                            <p className="text-slate-400">Status: <span className="text-emerald-400 font-semibold capitalize">{order.paymentStatus || 'Paid'}</span></p>
                          </div>
                        </div>

                        {order.status === 'pending' && (
                          <div className="flex justify-end pt-2">
                            <button
                              onClick={() => handleCancelOrder(order._id)}
                              disabled={cancellingOrder === order._id}
                              className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold rounded-xl text-xs transition-all"
                            >
                              {cancellingOrder === order._id ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ================================================= */}
      {/* 🗺️ LIVE TRACKING MODAL */}
      {/* ================================================= */}
      {trackingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative animate-in zoom-in duration-300">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FaRoute className="text-cyan-400 text-lg" />
                <h3 className="font-bold text-white text-base">Live Order Tracking</h3>
              </div>
              <button 
                onClick={() => setTrackingModal(null)} 
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Tracking Progress Timeline */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                {getTrackingSteps(trackingModal.status).map((step) => (
                  <div key={step.id} className="flex flex-col items-center text-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 border ${
                      step.completed 
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30' 
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}>
                      {step.icon}
                    </div>
                    <span className={`text-[10px] font-semibold hidden sm:inline ${step.completed ? 'text-cyan-400' : 'text-slate-500'}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 🔐 Live Verification OTP in modal */}
            {trackingModal.deliveryOtp && trackingModal.status !== 'delivered' && trackingModal.status !== 'cancelled' && (
              <div className="bg-cyan-950/60 border border-cyan-500/40 rounded-2xl p-3.5 mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-cyan-200">🔐 Doorstep Verification OTP</p>
                  <p className="text-[10px] text-slate-400">Provide this 4-digit code to driver at delivery</p>
                </div>
                <span className="text-base font-black font-mono text-cyan-300 tracking-widest bg-slate-950 px-3.5 py-1.5 rounded-xl border border-cyan-400 shadow-lg">
                  {trackingModal.deliveryOtp}
                </span>
              </div>
            )}

            {/* Leaflet Map */}
            <div className="h-64 rounded-2xl overflow-hidden border border-slate-800 mb-4">
              <LiveTrackingMap 
                orderId={trackingModal._id} 
                deliveryAddress={trackingModal.deliveryAddress} 
              />
            </div>

            {/* Delivery Executive Info */}
            {trackingModal.deliveryDetails?.deliveryBoyName ? (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                    {trackingModal.deliveryDetails.deliveryBoyName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{trackingModal.deliveryDetails.deliveryBoyName}</h4>
                    <p className="text-[11px] text-slate-400">Delivery Partner Assigned</p>
                  </div>
                </div>
                <a 
                  href={`tel:${trackingModal.deliveryDetails.deliveryBoyMobile}`}
                  className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
                >
                  <FaPhone /> Call Driver
                </a>
              </div>
            ) : (
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
                ⏳ Assigning nearest delivery partner in your area...
              </div>
            )}

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MyOrders;