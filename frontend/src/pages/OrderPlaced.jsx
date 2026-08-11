import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaCheckCircle, 
  FaBox, 
  FaMapMarkerAlt, 
  FaMoneyBillWave, 
  FaArrowLeft, 
  FaStore,
  FaCalendarAlt,
  FaCopy
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { gsap } from 'gsap';

const OrderPlaced = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const orderData = location.state?.orderData || null;

  useEffect(() => {
    if (!orderData) {
      navigate('/home');
    }
  }, [orderData, navigate]);

  // GSAP Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".order-container", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });
      gsap.from(".success-badge", {
        scale: 0,
        rotate: 180,
        duration: 0.6,
        delay: 0.2,
        ease: "back.out(1.7)",
      });
      gsap.from(".detail-row", {
        x: -10,
        opacity: 0,
        duration: 0.4,
        stagger: 0.1,
        delay: 0.4,
        ease: "power2.out",
      });
    });

    return () => ctx.revert();
  }, []);

  if (!orderData) return null;

  // Format Date
  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format Order ID (Show last 8 chars)
  const displayOrderId = orderData._id ? `#${orderData._id.slice(-8).toUpperCase()}` : '#N/A';

  // Copy ID to clipboard
  const handleCopyId = () => {
    if (orderData._id) {
      navigator.clipboard.writeText(orderData._id);
      alert('Order ID copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-8 px-4">
      <div className="order-container w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* ==================== TOP SUCCESS BANNER ==================== */}
        <div className="bg-emerald-50 px-6 py-5 border-b border-emerald-100 flex items-center gap-4">
          <div className="success-badge w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-md shadow-emerald-500/20 flex-shrink-0">
            <FaCheckCircle className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-emerald-700">
              Order Placed Successfully! 🎉
            </h1>
            <p className="text-sm text-emerald-600/80">
              Your order has been confirmed.
            </p>
          </div>
        </div>

        {/* ==================== ORDER ID CARD ==================== */}
        <div className="p-6 border-b border-gray-100 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <FaBox className="text-cyan-600 w-5 h-5" />
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Order ID</p>
                <p className="text-base font-bold text-gray-800 font-mono tracking-wide">
                  {displayOrderId}
                </p>
              </div>
            </div>
            <button 
              onClick={handleCopyId}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              <FaCopy className="w-4 h-4" /> Copy ID
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <FaCalendarAlt className="w-3 h-3" /> {formatDate(orderData.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Status: <span className="text-emerald-600 font-medium">Confirmed</span>
            </span>
          </div>
        </div>

        {/* ==================== ORDER DETAILS ==================== */}
        <div className="p-6 border-b border-gray-100 bg-white">
          <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <FaStore className="w-4 h-4" /> Order Summary
          </h2>
          
          {/* Items Table */}
          <div className="bg-gray-50/50 rounded-xl overflow-hidden">
            <div className="divide-y divide-gray-200">
              {orderData.shopOrders?.map((shop, idx) => (
                shop.shopOrderItems?.map((item, i) => {
                  const totalPrice = item.price * item.quantity;
                  return (
                    <div key={`${idx}-${i}`} className="detail-row flex items-center justify-between p-3 sm:px-4 hover:bg-white transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="w-8 h-8 bg-cyan-100 text-cyan-700 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{item.name || 'Item'}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity || 1}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-gray-800 flex-shrink-0">₹{totalPrice.toFixed(0)}</p>
                    </div>
                  );
                })
              ))}
            </div>
          </div>

          {/* Delivery & Payment Summary */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="detail-row bg-gray-50/80 rounded-lg p-3 sm:p-4 border border-gray-100">
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-red-500 w-4 h-4 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Delivery Address</p>
                  <p className="text-sm font-medium text-gray-700 mt-0.5">
                    {orderData.deliveryAddress?.text || 'Address not provided'}
                  </p>
                </div>
              </div>
            </div>

            <div className="detail-row bg-gray-50/80 rounded-lg p-3 sm:p-4 border border-gray-100">
              <div className="flex items-start gap-3">
                <FaMoneyBillWave className="text-orange-500 w-4 h-4 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Payment & Total</p>
                  <p className="text-sm font-medium text-gray-700 mt-0.5 capitalize">
                    {orderData.paymentMethod || 'COD'}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">Total</span>
                    <span className="text-base font-bold text-emerald-600">₹{orderData.totalAmount || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== ACTION BUTTONS ==================== */}
        <div className="p-6 bg-white flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => navigate('/home')}
            className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
          >
            Continue Shopping 🐟
          </button>
          <button 
            onClick={() => navigate('/my-orders')}
            className="flex-1 py-3 bg-white border-2 border-gray-200 hover:border-cyan-400 text-gray-700 hover:text-cyan-600 font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <FaArrowLeft className="w-4 h-4" /> View My Orders
          </button>
        </div>

        {/* ==================== FOOTER ==================== */}
        <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Thank you for choosing <span className="text-cyan-600 font-medium">AquaMart</span>! 💙
          </p>
        </div>

      </div>
    </div>
  );
};

export default OrderPlaced;