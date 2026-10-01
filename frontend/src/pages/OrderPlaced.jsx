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
  FaCopy,
  FaReceipt,
  FaMotorcycle
} from 'react-icons/fa';
import { gsap } from 'gsap';

const OrderPlaced = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });
      gsap.from(".success-badge", {
        scale: 0,
        rotate: 180,
        duration: 0.7,
        delay: 0.2,
        ease: "back.out(1.7)",
      });
      gsap.from(".detail-row", {
        x: -15,
        opacity: 0,
        duration: 0.4,
        stagger: 0.08,
        delay: 0.4,
        ease: "power2.out",
      });
    });

    return () => ctx.revert();
  }, []);

  if (!orderData) return null;

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

  const displayOrderId = orderData._id ? `#${orderData._id.slice(-8).toUpperCase()}` : '#AQM' + Math.floor(100000 + Math.random() * 900000);

  const handleCopyId = () => {
    if (orderData._id) {
      navigator.clipboard.writeText(orderData._id);
      alert('Order ID copied to clipboard!');
    }
  };

  // Safe fallback for shop items
  const items = orderData.shopOrders?.[0]?.shopOrderItems || orderData.cartItems || [];
  const grandTotal = orderData.totalAmount || (orderData.cartItems?.reduce((acc, i) => acc + (i.price * i.quantity), 0) + 20) || 0;

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 flex justify-center items-center py-10 px-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="order-container w-full max-w-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative z-10">
        
        {/* TOP SUCCESS BANNER */}
        <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/60 px-6 py-6 border-b border-emerald-500/20 flex items-center gap-4">
          <div className="success-badge w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10 flex-shrink-0">
            <FaCheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              Order Confirmed! 🎉
            </h1>
            <p className="text-xs sm:text-sm text-emerald-400/90 mt-0.5">
              Your fresh seafood is being prepared for immediate dispatch.
            </p>
          </div>
        </div>

        {/* ORDER SUMMARY HEADER */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <FaReceipt className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">Invoice Reference</p>
                <p className="text-base font-bold text-white font-mono tracking-wider">
                  {displayOrderId}
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleCopyId}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 transition-all self-start sm:self-auto"
            >
              <FaCopy className="w-3.5 h-3.5 text-cyan-400" /> Copy Order ID
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <FaCalendarAlt className="w-3.5 h-3.5 text-slate-500" /> {formatDate(orderData.createdAt || orderData.orderPlacedAt)}
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Live Status: Pending Dispatch
            </span>
          </div>
        </div>

        {/* DETAILS SECTION */}
        <div className="p-6 space-y-6">
          
          {/* Items Preview */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Items Ordered
            </h3>
            <div className="space-y-2 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
              {items.map((item, idx) => {
                const title = item.name || item.itemName || "Seafood Catch";
                const qty = item.weightInGrams ? (item.weightInGrams >= 1000 ? `${item.weightInGrams/1000} kg` : `${item.weightInGrams} g`) : (item.quantity ? `${item.quantity} portion` : "1 kg");
                const price = item.price || 0;

                return (
                  <div key={idx} className="detail-row flex justify-between items-center text-xs py-1.5 border-b border-slate-800/60 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                      <span className="font-semibold text-slate-200">{title}</span>
                      <span className="text-[11px] text-cyan-400 font-mono">({qty})</span>
                    </div>
                    <span className="font-bold text-white">₹{price}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery & Payment Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="detail-row p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <p className="text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                <FaMapMarkerAlt className="text-rose-400" /> Delivery Location:
              </p>
              <p className="text-slate-200 font-semibold line-clamp-2">
                {orderData.deliveryAddress?.text || "Doorstep Delivery Address"}
              </p>
            </div>

            <div className="detail-row p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <p className="text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                <FaMoneyBillWave className="text-emerald-400" /> Payment Mode:
              </p>
              <p className="text-slate-200 font-semibold uppercase">
                {orderData.paymentMethod === 'cod' ? 'Cash On Delivery (Unpaid)' : `${orderData.paymentMethod || 'Online'} (Verified Paid)`}
              </p>
              <p className="text-[11px] text-cyan-400 mt-0.5 font-bold">
                Total Billed: ₹{Math.round(grandTotal)}
              </p>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => navigate('/my-orders')}
              className="flex-1 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
              <FaMotorcycle className="w-4 h-4" /> Live Track Order
            </button>

            <button
              onClick={() => navigate('/home')}
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold rounded-xl text-xs border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <FaArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default OrderPlaced;