import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaShoppingCart, FaTrash, FaArrowLeft, FaCheckCircle, FaMinus, FaPlus, FaBoxOpen } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { removeFromCart, updateQuantity, clearCart } from '../redux/userSlice';

import Footer from '../components/Footer';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { cartitems } = useSelector((state) => state.user);

  // Accurate Total Price Calculation based on individual weight
  const totalPrice = cartitems.reduce((acc, item) => {
    const weightInGrams = item.quantity || 1000; // Default 1kg
    const pricePerGram = item.price / 1000;
    return acc + (pricePerGram * weightInGrams);
  }, 0);

  const deliveryFee = totalPrice >= 499 || totalPrice === 0 ? 0 : 40;
  const packagingFee = totalPrice > 0 ? 20 : 0;
  const gstTax = Math.round(totalPrice * 0.05);
  const grandTotal = Math.round(totalPrice + deliveryFee + packagingFee + gstTax);

  const handleWeightChange = (item, newWeightVal) => {
    const itemId = item._id || item.id;
    let finalWeight = 0;

    if (typeof newWeightVal === 'number') {
      finalWeight = newWeightVal;
    } else if (typeof newWeightVal === 'string') {
      const val = newWeightVal.toLowerCase().trim();
      if (val.includes('kg')) {
        finalWeight = parseFloat(val) * 1000;
      } else {
        finalWeight = parseFloat(val);
      }
    }

    if (!isNaN(finalWeight) && finalWeight > 0) {
      dispatch(updateQuantity({ _id: itemId, quantity: finalWeight }));
    }
  };

  const handleRemove = (item) => {
    dispatch(removeFromCart(item));
  };

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute top-20 -left-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/home')}
              className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/40 hover:bg-slate-800 transition-all duration-200"
            >
              <FaArrowLeft className="w-4 h-4 text-cyan-400" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                My Catch Cart
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {cartitems.length} {cartitems.length === 1 ? 'item' : 'items'} in your seafood basket
              </p>
            </div>
          </div>

          {cartitems.length > 0 && (
            <button 
              onClick={() => dispatch(clearCart())}
              className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition-all"
            >
              Clear Basket
            </button>
          )}
        </div>

        {/* Cart Content */}
        {cartitems.length === 0 ? (
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto shadow-2xl">
            <FaBoxOpen className="w-16 h-16 text-cyan-400/60 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Your Cart is Empty</h2>
            <p className="text-slate-400 text-sm mb-6">Explore our live fresh seafood catch and add items.</p>
            <Link to="/home" className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT: Items List (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              {cartitems.map((item) => {
                const currentWeight = item.quantity > 0 ? item.quantity : 1000;
                const displayWeight = currentWeight >= 1000 
                  ? `${(currentWeight / 1000).toFixed(1)} kg` 
                  : `${currentWeight} g`;
                
                const itemPrice = Math.round((item.price / 1000) * currentWeight);

                return (
                  <div 
                    key={item._id || item.id} 
                    className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center shadow-xl hover:border-slate-700 transition-all duration-200"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 overflow-hidden rounded-xl bg-slate-950 border border-slate-800">
                      <img 
                        src={item.image || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200"} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>

                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-base sm:text-lg text-white">{item.name}</h3>
                          <span className="text-[11px] text-cyan-400 font-medium">₹{item.price}/kg base rate</span>
                        </div>
                        <p className="text-cyan-400 font-extrabold text-lg">
                          ₹{itemPrice}
                        </p>
                      </div>
                      
                      {/* Dynamic Weight Adjustment */}
                      <div className="flex flex-wrap items-center gap-2 mt-3 bg-slate-950/70 border border-slate-800/80 p-2 rounded-xl">
                        <span className="text-xs font-semibold text-slate-400 mr-1">Portion:</span>
                        
                        <div className="px-2.5 py-1 bg-slate-900 border border-slate-700/80 rounded-lg text-xs font-bold text-cyan-400 font-mono">
                          {displayWeight}
                        </div>

                        {/* Weight Quick Step Buttons */}
                        <div className="flex items-center gap-1 ml-1">
                          <button 
                            onClick={() => {
                              const newWeight = Math.max(250, currentWeight - 250);
                              handleWeightChange(item, newWeight);
                            }}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center text-xs font-bold transition-all"
                            title="Decrease 250g"
                          >
                            <FaMinus className="w-2.5 h-2.5" />
                          </button>
                          
                          <button 
                            onClick={() => {
                              const newWeight = currentWeight + 250;
                              handleWeightChange(item, newWeight);
                            }}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center text-xs font-bold transition-all"
                            title="Increase 250g"
                          >
                            <FaPlus className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        {/* Quick Preset Buttons */}
                        <div className="flex items-center gap-1 text-[10px]">
                          <button 
                            onClick={() => handleWeightChange(item, 500)}
                            className={`px-2 py-0.5 rounded border transition-all ${currentWeight === 500 ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'}`}
                          >
                            500g
                          </button>
                          <button 
                            onClick={() => handleWeightChange(item, 1000)}
                            className={`px-2 py-0.5 rounded border transition-all ${currentWeight === 1000 ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'}`}
                          >
                            1kg
                          </button>
                        </div>

                        {/* Remove */}
                        <button 
                          onClick={() => handleRemove(item)}
                          className="flex items-center gap-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ml-auto"
                        >
                          <FaTrash size={11} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT: Order Summary (5 Cols) */}
            <div className="lg:col-span-5">
              <div className="sticky top-6 bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FaCheckCircle className="text-cyan-400" /> Price & Bill Summary
                </h3>
                
                <div className="space-y-2.5 text-xs text-slate-300 pt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Items Subtotal</span>
                    <span className="font-semibold text-slate-100">₹{Math.round(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Delivery Charges</span>
                    <span className={deliveryFee === 0 ? "text-emerald-400 font-semibold" : "font-semibold text-slate-100"}>
                      {deliveryFee === 0 ? "FREE (Orders > ₹499)" : `₹${deliveryFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ice-Pack Sealed Packaging</span>
                    <span className="font-semibold text-slate-100">₹{packagingFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">GST (5% Seafood FSSAI)</span>
                    <span className="font-semibold text-slate-100">₹{gstTax}</span>
                  </div>
                </div>
                
                <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-base font-bold text-white">
                  <span>Estimated Total</span>
                  <span className="text-xl text-cyan-400">₹{grandTotal}</span>
                </div>
                
                <button 
                  className="w-full mt-2 py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 active:scale-98 transition-all"
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout (₹{grandTotal}) →
                </button>

                <p className="text-[11px] text-slate-400 text-center">
                  🛡️ Fresh catch quality guarantee & live GPS tracking included.
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;