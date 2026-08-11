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
  FaRoute
} from 'react-icons/fa';
import { HiOutlineLocationMarker } from 'react-icons/hi';

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
      const response = await axios.get(`${serverUrl}/api/order/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      showNotification('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return { bg: 'bg-gray-100', text: 'text-gray-600', icon: <FaBox />, label: 'Pending' };
    const map = {
      'pending': { bg: 'bg-orange-100', text: 'text-orange-600', icon: <FaClock />, label: 'Pending' },
      'confirmed': { bg: 'bg-blue-100', text: 'text-blue-600', icon: <FaCheckCircle />, label: 'Confirmed' },
      'processing': { bg: 'bg-indigo-100', text: 'text-indigo-600', icon: <FaSpinner />, label: 'Processing' },
      'shipped': { bg: 'bg-purple-100', text: 'text-purple-600', icon: <FaTruck />, label: 'Shipped' },
      'out_for_delivery': { bg: 'bg-pink-100', text: 'text-pink-600', icon: <FaTruck />, label: 'Out for Delivery' },
      'delivered': { bg: 'bg-green-100', text: 'text-green-600', icon: <FaCheckCircle />, label: 'Delivered' },
      'cancelled': { bg: 'bg-red-100', text: 'text-red-600', icon: <FaTimesCircle />, label: 'Cancelled' }
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

  // Safe shop name resolver
  const getShopName = (shopOrder, idx = 0) => {
    if (!shopOrder) return `Shop #${idx + 1}`;
    
    return (
      shopOrder.shop?.name || 
      shopOrder.shop?.shopName || 
      shopOrder.shopName || 
      shopOrder.shop?.title ||
      shopOrder.name ||
      shopOrder.shopOrderItems?.[0]?.shopName ||
      shopOrder.shopOrderItems?.[0]?.shop?.name ||
      `Shop #${idx + 1}`
    );
  };

  const getShopAddress = (shopOrder) => {
    if (!shopOrder) return '';
    return (
      shopOrder.shop?.address ||
      shopOrder.shopAddress ||
      shopOrder.shop?.location ||
      ''
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
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {notification.show && (
          <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl backdrop-blur-md bg-white/95 border ${notification.type === 'success' ? 'border-green-200' : 'border-red-200'} transform transition-all duration-300 flex items-center gap-3`}>
            {notification.type === 'success' ? <FaCheckCircle className="text-green-500" /> : <FaTimesCircle className="text-red-500" />}
            <p className="text-sm font-medium text-slate-800">{notification.message}</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <button onClick={() => navigate('/home')} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
            <FaArrowLeft className="text-sm" /> Back
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
              <FaShoppingBag className="text-emerald-600 text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">My Orders</h1>
              <p className="text-xs text-slate-400">{orders.length} orders placed</p>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-md p-12 text-center border border-slate-100">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBox className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-700">No orders yet!</h2>
            <p className="text-slate-400 text-sm mt-2 mb-6">Explore our fresh seafood and place your first order.</p>
            <button onClick={() => navigate('/home')} className="bg-emerald-600 text-white px-8 py-2.5 rounded-full font-medium hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const badge = getStatusBadge(order.status || 'pending');
              const canCancel = ['pending', 'confirmed', 'processing'].includes(order.status?.toLowerCase());
              const isExpanded = expandedOrder === order._id;
              const allItems = getAllOrderItemsWithShop(order);

              return (
                <div key={order._id} className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300">
                  
                  {/* Top Bar: Order ID, Date & Status */}
                  <div className="p-5 border-b border-slate-50 flex flex-wrap justify-between items-center gap-3 bg-gradient-to-r from-white to-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-2 rounded-xl">
                        <FaBox className="text-slate-600 text-sm" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Order ID</p>
                        <p className="font-mono font-bold text-slate-700 text-sm">#{order._id?.slice(-8).toUpperCase()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-xs text-slate-400 flex items-center gap-1 bg-slate-50 px-3 py-1 rounded-full">
                        <FaCalendarAlt className="text-emerald-500" /> {formatDate(order.createdAt)}
                      </p>
                      <span className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${badge.bg} ${badge.text}`}>
                        {badge.icon} {badge.label}
                      </span>
                      <button 
                        onClick={() => setTrackingModal(order._id)}
                        className="ml-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2 rounded-full shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all hover:scale-105"
                      >
                        <FaTruck /> Track Order
                      </button>
                    </div>
                  </div>

                  {/* Items & Exact Shop Name Preview Row */}
                  <div className="px-5 py-3 border-b border-slate-50 bg-slate-50/20 flex flex-wrap items-center gap-3 overflow-x-auto">
                    {allItems.slice(0, 4).map((item, idx) => {
                      const imgUrl = getItemImage(item);
                      const itemName = item.name || item.itemName || item.item?.name || 'Item';
                      
                      return (
                        <div key={idx} className="flex items-center gap-2.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-2xs">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-100">
                            {imgUrl ? (
                              <img src={imgUrl} alt={itemName} className="w-full h-full object-cover" />
                            ) : (
                              <FaImage className="text-slate-300 text-xs" />
                            )}
                          </div>
                          
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-700 max-w-[120px] truncate">{itemName}</span>
                            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 truncate">
                              <FaStore className="text-[9px]" /> {item.shopName}
                            </span>
                          </div>

                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md ml-1">x{item.quantity}</span>
                        </div>
                      );
                    })}
                    {allItems.length > 4 && (
                      <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl">
                        +{allItems.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Total Amount & View Details Trigger */}
                  <div 
                    className="px-5 py-3 cursor-pointer flex justify-between items-center hover:bg-slate-50/50 transition-colors"
                    onClick={() => toggleOrderExpansion(order._id)}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-slate-500">Total Items: <span className="text-slate-800 font-bold">{allItems.length}</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-1.5 rounded-full border border-emerald-100">
                        <span className="text-xs text-slate-500">Total</span>
                        <span className="ml-1.5 font-bold text-emerald-600">₹{order.totalAmount?.toFixed(2)}</span>
                      </div>
                      <span className="text-slate-400 text-xs flex items-center gap-1 font-medium hover:text-emerald-600">
                        {isExpanded ? 'Hide Details' : 'View Details'} 
                        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Details Section */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-50 bg-slate-50/30 space-y-6">
                      
                      {order.shopOrders?.map((shopOrder, idx) => {
                        const shopName = getShopName(shopOrder, idx);
                        const shopAddr = getShopAddress(shopOrder);

                        return (
                          <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                            
                            {/* Exact Shop Header Details */}
                            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5 rounded-xl text-white shadow-md shadow-emerald-500/20">
                                <FaStore className="text-base" />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                  {shopName}
                                </h4>
                                {shopAddr && (
                                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                    <HiOutlineLocationMarker /> {shopAddr}
                                  </p>
                                )}
                              </div>
                              <div className="ml-auto text-right">
                                <p className="text-[10px] text-slate-400">Subtotal</p>
                                <p className="font-bold text-emerald-600">₹{shopOrder.subtotal?.toFixed(2)}</p>
                              </div>
                            </div>

                            {/* Shop Items Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {shopOrder.shopOrderItems?.map((item, itemIdx) => {
                                const itemName = item.name || item.itemName || item.item?.name || 'Fresh Item';
                                const imgUrl = getItemImage(item);

                                return (
                                  <div key={itemIdx} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 hover:border-emerald-200 shadow-sm hover:shadow-md transition-all duration-300 relative group">
                                    
                                    <div className="w-20 h-20 rounded-xl bg-slate-50 flex-shrink-0 overflow-hidden flex items-center justify-center border border-slate-200 relative">
                                      {imgUrl ? (
                                        <img 
                                          src={imgUrl} 
                                          alt={itemName}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                            const fallbackEl = e.target.nextElementSibling;
                                            if (fallbackEl) fallbackEl.style.display = 'flex';
                                          }}
                                        />
                                      ) : null}
                                      <div 
                                        className="flex-col items-center justify-center w-full h-full bg-emerald-50 text-emerald-500 text-xs font-semibold text-center p-1"
                                        style={{ display: imgUrl ? 'none' : 'flex' }}
                                      >
                                        <FaImage className="text-xl mb-1 text-emerald-400" />
                                        <span className="text-[10px] text-slate-400">No Image</span>
                                      </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <p className="font-bold text-slate-800 text-base truncate">{itemName}</p>
                                      <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">₹{item.price?.toFixed(2)}</span>
                                        <span className="text-xs text-slate-400">Qty: {item.quantity}</span>
                                      </div>
                                      <div className="mt-2 flex items-center gap-2">
                                        <span className="text-xs text-slate-400 font-medium">Item Total:</span>
                                        <span className="text-sm font-bold text-emerald-600">₹{(item.price * item.quantity).toFixed(2)}</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                      {/* Address & Payment Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-2">
                            <HiOutlineLocationMarker className="text-lg" /> DELIVERY ADDRESS
                          </div>
                          <p className="font-medium text-slate-800 text-sm flex items-center gap-2">
                            <FaUser className="text-slate-400 text-xs" /> {userData?.fullName || userData?.name || 'User'}
                          </p>
                          <p className="text-sm text-slate-500 mt-1 pl-6">{order.deliveryAddress?.text}</p>
                          {order.deliveryAddress?.city && (
                            <p className="text-xs text-slate-400 pl-6 mt-0.5">{order.deliveryAddress.city}, {order.deliveryAddress.state}</p>
                          )}
                          <p className="text-sm text-slate-500 flex items-center gap-2 mt-1 pl-6">
                            <FaPhone className="text-slate-400 text-xs" /> {userData?.mobile || 'N/A'}
                          </p>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-2">
                              <FaCreditCard className="text-lg" /> PAYMENT DETAILS
                            </div>
                            <div className="flex justify-between text-sm border-b border-slate-100 pb-2 mb-2">
                              <span className="text-slate-500">Method</span>
                              <span className="font-medium text-slate-700 flex items-center gap-1.5">
                                {order.paymentMethod === 'cod' ? <FaWallet className="text-emerald-500 text-xs" /> : <FaCreditCard className="text-blue-500 text-xs" />}
                                {order.paymentMethod?.toUpperCase() || 'COD'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-slate-700">Grand Total</span>
                              <span className="font-bold text-emerald-600 text-lg">₹{order.totalAmount?.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                            {canCancel && (
                              <button onClick={() => handleCancelOrder(order._id)} disabled={cancellingOrder === order._id} className="flex items-center gap-1.5 text-red-500 hover:text-red-600 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors border border-red-200 disabled:opacity-50">
                                {cancellingOrder === order._id ? <FaSpinner className="animate-spin" /> : <FaTrash />} Cancel
                              </button>
                            )}
                            <button className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-emerald-50 transition-colors border border-emerald-200">
                              <FaHeadset /> Support
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tracking Modal */}
        {trackingModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white relative">
                <button onClick={() => setTrackingModal(null)} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">
                  <FaTimesCircle className="text-xl cursor-pointer" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <FaTruck className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Track Your Order</h3>
                    <p className="text-sm text-emerald-100">Live updates for Order #{trackingModal?.slice(-8).toUpperCase()}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-sm text-slate-500">Order ID</span>
                  <span className="font-mono text-sm font-bold text-slate-800">#{trackingModal?.slice(-8).toUpperCase()}</span>
                </div>
                
                <div className="space-y-6 relative px-2">
                   <div className="absolute left-[18px] top-4 bottom-4 w-0.5 bg-slate-200"></div>

                   {(() => {
                     const currentOrder = orders.find(o => o._id === trackingModal);
                     const steps = getTrackingSteps(currentOrder?.status || 'pending');

                     return steps.map((step) => (
                       <div key={step.id} className="flex items-start gap-5 relative z-10">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-all duration-300 ${
                           step.completed 
                             ? 'bg-emerald-500 border-emerald-500 shadow-md shadow-emerald-500/30 text-white' 
                             : 'bg-white border-slate-300 text-slate-400'
                         }`}>
                           {step.completed ? step.icon : <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>}
                         </div>
                         
                         <div className={`pb-2 ${step.completed ? 'opacity-100' : 'opacity-60'}`}>
                           <p className={`text-base font-bold ${step.completed ? 'text-slate-800' : 'text-slate-500'}`}>
                             {step.label}
                             {step.isCurrent && <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-normal">Active</span>}
                           </p>
                           <p className="text-sm text-slate-500 mt-0.5">{step.description}</p>
                           {step.isCurrent && (
                             <p className="text-xs text-emerald-600 font-medium mt-1 animate-pulse">In Progress...</p>
                           )}
                         </div>
                       </div>
                     ));
                   })()}
                </div>
              </div>
              
              <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                <button onClick={() => setTrackingModal(null)} className="w-full bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-300 transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;